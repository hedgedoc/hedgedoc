/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GuestAccess, NotePermissionsUpdateDto } from '@hedgedoc/commons';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import noteConfiguration, { NoteConfig } from '../config/note.config';
import { PermissionsUpdateInconsistentError } from '../errors/errors';
import { NoteEvent, NoteEventMap } from '../events';
import { Group } from '../groups/group.entity';
import { GroupsService } from '../groups/groups.service';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { MediaUpload } from '../media/media-upload.entity';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { checkArrayForDuplicates } from '../utils/arrayDuplicatCheck';
import { NoteGroupPermission } from './note-group-permission.entity';
import { NotePermission } from './note-permission.enum';
import { NoteUserPermission } from './note-user-permission.entity';
import { convertGuestAccessToNotePermission } from './utils/convert-guest-access-to-note-permission';
import { findHighestNotePermissionByGroup } from './utils/find-highest-note-permission-by-group';
import { findHighestNotePermissionByUser } from './utils/find-highest-note-permission-by-user';

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
    this.notifyOthers(note);
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
    this.notifyOthers(note);
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
    this.notifyOthers(note);
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
    this.notifyOthers(note);
    return await this.noteRepository.save(note);
  }
}
