/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PermissionsUpdateInconsistentError } from '../errors/errors';
import { Group } from '../groups/group.entity';
import { GroupsService } from '../groups/groups.service';
import { SpecialGroup } from '../groups/groups.special';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { NotePermissionsUpdateDto } from '../notes/note-permissions.dto';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { checkArrayForDuplicates } from '../utils/arrayDuplicatCheck';
import { NoteGroupPermission } from './note-group-permission.entity';
import { NoteUserPermission } from './note-user-permission.entity';

// TODO move to config or remove
export enum GuestPermission {
  DENY = 'deny',
  READ = 'read',
  WRITE = 'write',
  CREATE = 'create',
  CREATE_ALIAS = 'createAlias',
}

@Injectable()
export class PermissionsService {
  constructor(
    public usersService: UsersService,
    public groupsService: GroupsService,
    @InjectRepository(Note) private noteRepository: Repository<Note>,
    private readonly logger: ConsoleLoggerService,
  ) {}

  public guestPermission: GuestPermission; // TODO change to configOption
  async mayRead(user: User | null, note: Note): Promise<boolean> {
    if (await this.isOwner(user, note)) return true;

    if (await this.hasPermissionUser(user, note, false)) return true;

    // noinspection RedundantIfStatementJS
    if (await this.hasPermissionGroup(user, note, false)) return true;

    return false;
  }

  async mayWrite(user: User | null, note: Note): Promise<boolean> {
    if (await this.isOwner(user, note)) return true;

    if (await this.hasPermissionUser(user, note, true)) return true;

    // noinspection RedundantIfStatementJS
    if (await this.hasPermissionGroup(user, note, true)) return true;

    return false;
  }

  mayCreate(user: User | null): boolean {
    if (user) {
      return true;
    } else {
      if (
        this.guestPermission == GuestPermission.CREATE ||
        this.guestPermission == GuestPermission.CREATE_ALIAS
      ) {
        // TODO change to guestPermission to config option
        return true;
      }
    }
    return false;
  }

  async isOwner(user: User | null, note: Note): Promise<boolean> {
    if (!user) return false;
    const owner = await note.owner;
    if (!owner) return false;
    return owner.id === user.id;
  }

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
        userPermission.user.id === user.id &&
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
    // TODO: Get real config value
    let guestsAllowed = false;
    switch (this.guestPermission) {
      case GuestPermission.CREATE_ALIAS:
      case GuestPermission.CREATE:
      case GuestPermission.WRITE:
        guestsAllowed = true;
        break;
      case GuestPermission.READ:
        guestsAllowed = !wantEdit;
    }
    for (const groupPermission of await note.groupPermissions) {
      if (groupPermission.canEdit || !wantEdit) {
        // Handle special groups
        if (groupPermission.group.special) {
          if (groupPermission.group.name == SpecialGroup.LOGGED_IN) {
            return true;
          }
          if (
            groupPermission.group.name == SpecialGroup.EVERYONE &&
            (groupPermission.canEdit || !wantEdit) &&
            guestsAllowed
          ) {
            return true;
          }
        } else {
          // Handle normal groups
          if (user) {
            for (const member of await groupPermission.group.members) {
              if (member.id === user.id) return true;
            }
          }
        }
      }
    }
    return false;
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
      createdPermission.note = note;
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
      createdPermission.note = note;
      (await note.groupPermissions).push(createdPermission);
    }

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
    const permissions = await note.userPermissions;
    let permissionIndex = 0;
    const permission = permissions.find((value, index) => {
      permissionIndex = index;
      return value.user.id == permissionUser.id;
    });
    if (permission != undefined) {
      permission.canEdit = canEdit;
      permissions[permissionIndex] = permission;
    } else {
      const noteUserPermission = NoteUserPermission.create(
        permissionUser,
        note,
        canEdit,
      );
      (await note.userPermissions).push(noteUserPermission);
    }
    return await this.noteRepository.save(note);
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
    const permissionsFiltered = permissions.filter(
      (value) => value.user.id != permissionUser.id,
    );
    note.userPermissions = Promise.resolve(permissionsFiltered);
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
    const permissions = await note.groupPermissions;
    let permissionIndex = 0;
    const permission = permissions.find((value, index) => {
      permissionIndex = index;
      return value.group.id == permissionGroup.id;
    });
    if (permission != undefined) {
      permission.canEdit = canEdit;
      permissions[permissionIndex] = permission;
    } else {
      const noteGroupPermission = NoteGroupPermission.create(
        permissionGroup,
        note,
        canEdit,
      );
      (await note.groupPermissions).push(noteGroupPermission);
    }
    return await this.noteRepository.save(note);
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
    const permissionsFiltered = permissions.filter(
      (value: NoteGroupPermission) => {
        return value.group.id != permissionGroup.id;
      },
    );
    note.groupPermissions = Promise.resolve(permissionsFiltered);
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
    return await this.noteRepository.save(note);
  }
}
