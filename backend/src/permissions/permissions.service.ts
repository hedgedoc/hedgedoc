/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  getGuestAccessOrdinal,
  GuestAccess,
} from '../config/guest_access.enum';
import noteConfiguration, { NoteConfig } from '../config/note.config';
import { PermissionsUpdateInconsistentError } from '../errors/errors';
import { NoteEvent, NoteEventMap } from '../events';
import { Group } from '../groups/group.entity';
import { GroupsService } from '../groups/groups.service';
import { SpecialGroup } from '../groups/groups.special';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { MediaUpload } from '../media/media-upload.entity';
import { NotePermissionsUpdateDto } from '../notes/note-permissions.dto';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { checkArrayForDuplicates } from '../utils/arrayDuplicatCheck';
import { NoteGroupPermission } from './note-group-permission.entity';
import { NoteUserPermission } from './note-user-permission.entity';
import { Permission } from './permissions.enum';

@Injectable()
export class PermissionsService {
  constructor(
    private usersService: UsersService,
    private groupsService: GroupsService,
    @InjectRepository(Note) private noteRepository: Repository<Note>,
    private readonly logger: ConsoleLoggerService,
    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
    private eventEmitter: EventEmitter2<NoteEventMap>,
  ) {}
  /**
   * Checks if the given {@link User} is has the in {@link desiredPermission} specified permission on {@link Note}.
   *
   * @async
   * @param {Permission} desiredPermission - permission level to check for
   * @param {User} user - The user whose permission should be checked. Value is null if guest access should be checked
   * @param {Note} note - The note for which the permission should be checked
   * @return if the user has the specified permission on the note
   */
  public async checkPermissionOnNote(
    desiredPermission: Exclude<Permission, Permission.CREATE>,
    user: User | null,
    note: Note,
  ): Promise<boolean> {
    switch (desiredPermission) {
      case Permission.READ:
        return await this.mayRead(user, note);
      case Permission.WRITE:
        return await this.mayWrite(user, note);
      case Permission.OWNER:
        return await this.isOwner(user, note);
    }
    return false;
  }

  public async checkMediaDeletePermission(
    user: User,
    mediaUpload: MediaUpload,
  ): Promise<boolean> {
    const mediaUploadNote = await mediaUpload.note;
    const mediaUploadOwner = await mediaUpload.user;

    const owner =
      !!mediaUploadNote && (await this.isOwner(user, mediaUploadNote));

    return mediaUploadOwner?.id === user.id || owner;
  }

  /**
   * Checks if the given {@link User} is allowed to read the given {@link Note}.
   *
   * @async
   * @param {User} user - The user whose permission should be checked. Value is null if guest access should be checked
   * @param {Note} note - The note for which the permission should be checked
   * @return if the user is allowed to read the note
   */
  public async mayRead(user: User | null, note: Note): Promise<boolean> {
    return (
      (await this.isOwner(user, note)) ||
      (await this.hasPermissionUser(user, note, false)) ||
      (await this.hasPermissionGroup(user, note, false))
    );
  }

  /**
   * Checks if the given {@link User} is allowed to edit the given {@link Note}.
   *
   * @async
   * @param {User} user - The user whose permission should be checked
   * @param {Note} note - The note for which the permission should be checked. Value is null if guest access should be checked
   * @return if the user is allowed to edit the note
   */
  public async mayWrite(user: User | null, note: Note): Promise<boolean> {
    return (
      (await this.isOwner(user, note)) ||
      (await this.hasPermissionUser(user, note, true)) ||
      (await this.hasPermissionGroup(user, note, true))
    );
  }

  /**
   * Checks if the given {@link User} is allowed to create notes.
   *
   * @async
   * @param {User} user - The user whose permission should be checked. Value is null if guest access should be checked
   * @return if the user is allowed to create notes
   */
  public mayCreate(user: User | null): boolean {
    return !!user || this.noteConfig.guestAccess === GuestAccess.CREATE;
  }

  async isOwner(user: User | null, note: Note): Promise<boolean> {
    if (!user) return false;
    const owner = await note.owner;
    if (!owner) return false;
    return owner.id === user.id;
  }

  // noinspection JSMethodCanBeStatic
  private async hasPermissionUser(
    user: User | null,
    note: Note,
    wantEdit: boolean,
  ): Promise<boolean> {
    if (!user) {
      return false;
    }
    for (const userPermission of await note.userPermissions) {
      if (
        (await userPermission.user).id === user.id &&
        (userPermission.canEdit || !wantEdit)
      ) {
        return true;
      }
    }
    return false;
  }

  private async hasPermissionGroup(
    user: User | null,
    note: Note,
    wantEdit: boolean,
  ): Promise<boolean> {
    if (user === null) {
      if (
        (!wantEdit &&
          getGuestAccessOrdinal(this.noteConfig.guestAccess) <
            getGuestAccessOrdinal(GuestAccess.READ)) ||
        (wantEdit &&
          getGuestAccessOrdinal(this.noteConfig.guestAccess) <
            getGuestAccessOrdinal(GuestAccess.WRITE))
      ) {
        return false;
      }
    }

    for (const groupPermission of await note.groupPermissions) {
      if (groupPermission.canEdit || !wantEdit) {
        // Handle special groups
        if ((await groupPermission.group).special) {
          if (
            (user &&
              (await groupPermission.group).name == SpecialGroup.LOGGED_IN) ||
            (await groupPermission.group).name == SpecialGroup.EVERYONE
          ) {
            return true;
          }
        } else {
          // Handle normal groups
          if (user) {
            for (const member of await (
              await groupPermission.group
            ).members) {
              if (member.id === user.id) return true;
            }
          }
        }
      }
    }
    return false;
  }

  private notifyOthers(noteId: Note['id']): void {
    this.eventEmitter.emit(NoteEvent.PERMISSION_CHANGE, noteId);
  }

  /**
   * @async
   * Update a notes permissions.
   * @param {Note} note - the note
   * @param {NotePermissionsUpdateDto} newPermissions - the permissions that should be applied to the note
   * @return {Note} the note with the new permissions
   * @throws {NotInDBError} there is no note with this id or alias
   * @throws {PermissionsUpdateInconsistentError} the new permissions specify a user or group twice.
   */
  async updateNotePermissions(
    note: Note,
    newPermissions: NotePermissionsUpdateDto,
  ): Promise<Note> {
    const users = newPermissions.sharedToUsers.map(
      (userPermission) => userPermission.username,
    );

    const groups = newPermissions.sharedToGroups.map(
      (groupPermission) => groupPermission.groupName,
    );

    if (checkArrayForDuplicates(users) || checkArrayForDuplicates(groups)) {
      this.logger.debug(
        `The PermissionUpdate requested specifies the same user or group multiple times.`,
        'updateNotePermissions',
      );
      throw new PermissionsUpdateInconsistentError(
        'The PermissionUpdate requested specifies the same user or group multiple times.',
      );
    }

    note.userPermissions = Promise.resolve([]);
    note.groupPermissions = Promise.resolve([]);

    // Create new userPermissions
    for (const newUserPermission of newPermissions.sharedToUsers) {
      const user = await this.usersService.getUserByUsername(
        newUserPermission.username,
      );
      const createdPermission = NoteUserPermission.create(
        user,
        note,
        newUserPermission.canEdit,
      );
      createdPermission.note = Promise.resolve(note);
      (await note.userPermissions).push(createdPermission);
    }

    // Create groupPermissions
    for (const newGroupPermission of newPermissions.sharedToGroups) {
      const group = await this.groupsService.getGroupByName(
        newGroupPermission.groupName,
      );
      const createdPermission = NoteGroupPermission.create(
        group,
        note,
        newGroupPermission.canEdit,
      );
      createdPermission.note = Promise.resolve(note);
      (await note.groupPermissions).push(createdPermission);
    }
    this.notifyOthers(note.id);
    return await this.noteRepository.save(note);
  }

  /**
   * @async
   * Set permission for a specific user on a note.
   * @param {Note} note - the note
   * @param {User} permissionUser - the user for which the permission should be set
   * @param {boolean} canEdit - specifies if the user can edit the note
   * @return {Note} the note with the new permission
   */
  async setUserPermission(
    note: Note,
    permissionUser: User,
    canEdit: boolean,
  ): Promise<Note> {
    if (await this.isOwner(permissionUser, note)) {
      return note;
    }
    const permissions = await note.userPermissions;
    const permission = await this.findPermissionForUser(
      permissions,
      permissionUser,
    );
    if (permission !== undefined) {
      permission.canEdit = canEdit;
    } else {
      const noteUserPermission = NoteUserPermission.create(
        permissionUser,
        note,
        canEdit,
      );
      (await note.userPermissions).push(noteUserPermission);
    }
    this.notifyOthers(note.id);
    return await this.noteRepository.save(note);
  }

  private async findPermissionForUser(
    permissions: NoteUserPermission[],
    user: User,
  ): Promise<NoteUserPermission | undefined> {
    for (const permission of permissions) {
      if ((await permission.user).id == user.id) {
        return permission;
      }
    }
    return undefined;
  }

  /**
   * @async
   * Remove permission for a specific user on a note.
   * @param {Note} note - the note
   * @param {User} permissionUser - the user for which the permission should be set
   * @return {Note} the note with the new permission
   */
  async removeUserPermission(note: Note, permissionUser: User): Promise<Note> {
    const permissions = await note.userPermissions;
    const newPermissions = [];
    for (const permission of permissions) {
      if ((await permission.user).id != permissionUser.id) {
        newPermissions.push(permission);
      }
    }
    note.userPermissions = Promise.resolve(newPermissions);
    this.notifyOthers(note.id);
    return await this.noteRepository.save(note);
  }

  /**
   * @async
   * Set permission for a specific group on a note.
   * @param {Note} note - the note
   * @param {Group} permissionGroup - the group for which the permission should be set
   * @param {boolean} canEdit - specifies if the group can edit the note
   * @return {Note} the note with the new permission
   */
  async setGroupPermission(
    note: Note,
    permissionGroup: Group,
    canEdit: boolean,
  ): Promise<Note> {
    this.logger.debug(
      `Setting group permission for group ${permissionGroup.name} on note ${note.id}`,
      'setGroupPermission',
    );
    const permissions = await note.groupPermissions;
    const permission = await this.findPermissionForGroup(
      permissions,
      permissionGroup,
    );
    if (permission !== undefined) {
      permission.canEdit = canEdit;
    } else {
      this.logger.debug(
        `Permission does not exist yet, creating new one.`,
        'setGroupPermission',
      );
      const noteGroupPermission = NoteGroupPermission.create(
        permissionGroup,
        note,
        canEdit,
      );
      (await note.groupPermissions).push(noteGroupPermission);
    }
    this.notifyOthers(note.id);
    return await this.noteRepository.save(note);
  }

  private async findPermissionForGroup(
    permissions: NoteGroupPermission[],
    group: Group,
  ): Promise<NoteGroupPermission | undefined> {
    for (const permission of permissions) {
      if ((await permission.group).id == group.id) {
        return permission;
      }
    }
    return undefined;
  }

  /**
   * @async
   * Remove permission for a specific group on a note.
   * @param {Note} note - the note
   * @param {Group} permissionGroup - the group for which the permission should be set
   * @return {Note} the note with the new permission
   */
  async removeGroupPermission(
    note: Note,
    permissionGroup: Group,
  ): Promise<Note> {
    const permissions = await note.groupPermissions;
    const newPermissions = [];
    for (const permission of permissions) {
      if ((await permission.group).id != permissionGroup.id) {
        newPermissions.push(permission);
      }
    }
    note.groupPermissions = Promise.resolve(newPermissions);
    this.notifyOthers(note.id);
    return await this.noteRepository.save(note);
  }

  /**
   * @async
   * Updates the owner of a note.
   * @param {Note} note - the note to use
   * @param {User} owner - the new owner
   * @return {Note} the updated note
   */
  async changeOwner(note: Note, owner: User): Promise<Note> {
    note.owner = Promise.resolve(owner);
    this.notifyOthers(note.id);
    return await this.noteRepository.save(note);
  }
}
