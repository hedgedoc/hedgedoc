/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectKnex, Knex } from 'nestjs-knex';

import { GuestAccess } from '../config/guest_access.enum';
import noteConfiguration, { NoteConfig } from '../config/note.config';
import {
  FieldNameGroup,
  FieldNameNote,
  Group,
  MediaUpload,
  Note,
  User,
} from '../database/types';
import { PermissionsUpdateInconsistentError } from '../errors/errors';
import { NoteEvent, NoteEventMap } from '../events';
import { GroupsService } from '../groups/groups.service';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { NotePermissionsUpdateDto } from '../notes/note-permissions.dto';
import { UsersService } from '../users/users.service';
import { hasArrayDuplicates } from '../utils/array-duplicate-check';
import { Username } from '../utils/username';
import { NotePermission } from './note-permission.enum';
import { convertGuestAccessToNotePermission } from './utils/convert-guest-access-to-note-permission';
import { findHighestNotePermissionByGroup } from './utils/find-highest-note-permission-by-group';
import { findHighestNotePermissionByUser } from './utils/find-highest-note-permission-by-user';

@Injectable()
export class PermissionService {
  constructor(
    private usersService: UsersService,
    private groupsService: GroupsService,
    @InjectKnex() private readonly knex: Knex,
    private readonly logger: ConsoleLoggerService,
    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
    private eventEmitter: EventEmitter2<NoteEventMap>,
  ) {}

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
    if (!user) {
      return false;
    }
    const owner = await note.owner;
    if (!owner) {
      return false;
    }
    return owner.id === user.id;
  }

  /**
   * Determines the {@link NotePermission permission} of the user on the given {@link Note}.
   *
   * @param {User | null} user The user whose permission should be checked
   * @param {Note} note The note that is accessed by the given user
   * @return {Promise<NotePermission>} The determined permission
   */
  public async determinePermission(
    user: User | null,
    note: Note,
  ): Promise<NotePermission> {
    if (user === null) {
      return await this.findGuestNotePermission(await note.groupPermissions);
    }

    if (await this.isOwner(user, note)) {
      return NotePermission.OWNER;
    }
    const userPermission = await findHighestNotePermissionByUser(
      user,
      await note.userPermissions,
    );
    if (userPermission === NotePermission.WRITE) {
      return userPermission;
    }
    const groupPermission = await findHighestNotePermissionByGroup(
      user,
      await note.groupPermissions,
    );
    return groupPermission > userPermission ? groupPermission : userPermission;
  }

  private async findGuestNotePermission(
    groupPermissions: NoteGroupPermission[],
  ): Promise<NotePermission> {
    if (this.noteConfig.guestAccess === GuestAccess.DENY) {
      return NotePermission.DENY;
    }

    const everyonePermission = await this.findPermissionForGroup(
      groupPermissions,
      await this.groupsService.getEveryoneGroup(),
    );
    if (everyonePermission === undefined) {
      return NotePermission.DENY;
    }
    const notePermission = everyonePermission.canEdit
      ? NotePermission.WRITE
      : NotePermission.READ;
    return this.limitNotePermissionToGuestAccessLevel(notePermission);
  }

  private limitNotePermissionToGuestAccessLevel(
    notePermission: NotePermission,
  ): NotePermission {
    const configuredGuestNotePermission = convertGuestAccessToNotePermission(
      this.noteConfig.guestAccess,
    );
    return configuredGuestNotePermission < notePermission
      ? configuredGuestNotePermission
      : notePermission;
  }

  private notifyOthers(note: Note): void {
    this.eventEmitter.emit(NoteEvent.PERMISSION_CHANGE, note);
  }

  /**
   * @async
   * Update a notes permissions.
   * @param {Note} note - the note
   * @param {NotePermissionsUpdateDto} newPermissions - the permissions that should be applied to the note
   * @return {Note} the note with the new permissions
   * @throws {NotInDBError} there is no note with this id or aliases
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

    if (hasArrayDuplicates(users) || hasArrayDuplicates(groups)) {
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
    this.notifyOthers(note);
    return await this.noteRepository.save(note);
  }

  /**
   * Set permission for a specific user on a note.
   * @param note the note
   * @param username the user for which the permission should be set
   * @param canEdit specifies if the user can edit the note
   * @return the note with the new permission
   */
  async setUserPermission(
    note: Note,
    username: Username,
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
    this.notifyOthers(note);
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
   * Remove permission for a specific user on a note.
   * @param note the note
   * @param username - the username for which the permission should be set
   * @return the note with the new permission
   */
  async removeUserPermission(note: Note, username: Username): Promise<Note> {
    const permissions = await note.userPermissions;
    const newPermissions = [];
    for (const permission of permissions) {
      if ((await permission.user).id != permissionUser.id) {
        newPermissions.push(permission);
      }
    }
    note.userPermissions = Promise.resolve(newPermissions);
    this.notifyOthers(note);
    return await this.noteRepository.save(note);
  }

  /**
   * Set permission for a specific group on a note.
   * @param noteId - the if of the note
   * @param permissionGroupName - the name of the group for which the permission should be set
   * @param canEdit - specifies if the group can edit the note
   * @param transaction the optional transaction to access the db
   * @return the note with the new permission
   */
  async setGroupPermission(
    noteId: Note[FieldNameNote.id],
    permissionGroupName: Group[FieldNameGroup.name],
    canEdit: boolean,
    transaction?: Knex,
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
    this.notifyOthers(note);
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
   * Remove permission for a specific group on a note.
   * @param note - the note
   * @param permissionGroup - the group for which the permission should be set
   * @return the note with the new permission
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
    this.notifyOthers(note);
    return await this.noteRepository.save(note);
  }

  /**
   * Updates the owner of a note.
   * @param note - the note to use
   * @param owner - the new owner
   * @return the updated note
   */
  async changeOwner(note: Note, owner: User): Promise<Note> {
    note.owner = Promise.resolve(owner);
    this.notifyOthers(note);
    return await this.noteRepository.save(note);
  }
}
