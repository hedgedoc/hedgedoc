/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NotePermissionsDto, PermissionLevel } from '@hedgedoc/commons';
import {
  FieldNameGroup,
  FieldNameGroupUser,
  FieldNameMediaUpload,
  FieldNameNote,
  FieldNameNoteGroupPermission,
  FieldNameNoteUserPermission,
  FieldNameUser,
  TableGroup,
  TableGroupUser,
  TableMediaUpload,
  TableNote,
  TableNoteGroupPermission,
  TableNoteUserPermission,
  TableUser,
} from '@hedgedoc/database';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import noteConfiguration, { NoteConfig } from '../config/note.config';
import {
  GenericDBError,
  NotInDBError,
  PermissionError,
} from '../errors/errors';
import { NoteEvent, NoteEventMap } from '../events';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { UsersService } from '../users/users.service';
import { convertEditabilityToPermissionLevel } from './utils/convert-editability-to-permission-level';

@Injectable()
export class PermissionService {
  constructor(
    @InjectConnection()
    private readonly knex: Knex,

    private readonly logger: ConsoleLoggerService,

    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,

    @Inject()
    private userService: UsersService,

    private eventEmitter: EventEmitter2<NoteEventMap>,
  ) {}

  /**
   * Checks whether a given user has the permission to remove a given upload
   *
   * @param userId The id of the user who wants to delete an upload
   * @param mediaUploadUuid The uuid of the upload
   * @returns true if the user is allowed to delete the upload, false otherwise
   * @throws NotInDBError if the upload does not exist
   */
  public async checkMediaDeletePermission(
    userId: number,
    mediaUploadUuid: string,
  ): Promise<boolean> {
    const dbResult = await this.knex(TableMediaUpload)
      .join(
        TableNote,
        `${TableMediaUpload}.${FieldNameMediaUpload.noteId}`,
        '=',
        `${TableNote}.${FieldNameNote.id}`,
      )
      .select<{
        [FieldNameMediaUpload.userId]: number;
        [FieldNameNote.ownerId]: number;
      }>(
        `${TableMediaUpload}.${FieldNameMediaUpload.userId}`,
        `${TableNote}.${FieldNameNote.ownerId}`,
      )
      .where(
        `${TableMediaUpload}.${FieldNameMediaUpload.uuid}`,
        mediaUploadUuid,
      )
      .first();

    if (dbResult === undefined) {
      throw new NotInDBError(
        `There is no upload with the id ${mediaUploadUuid}`,
        this.logger.getContext(),
        'checkMediaDeletePermission',
      );
    }

    return (
      dbResult[FieldNameMediaUpload.userId] === userId ||
      dbResult[FieldNameNote.ownerId] === userId
    );
  }

  /**
   * Checks if the given user is the owner of a note
   *
   * @param userId The id of the user
   * @param noteId The id of the note
   * @param transaction Optional transaction to use
   * @returns true if the user is the owner of the note, false otherwise
   * @throws NotInDBError if the note does not exist
   */
  async isOwner(
    userId: number | null,
    noteId: number,
    transaction?: Knex,
  ): Promise<boolean> {
    if (userId === null) {
      return false;
    }
    const dbActor = transaction ? transaction : this.knex;
    const dbResult = await dbActor(TableNote)
      .select(FieldNameNote.ownerId)
      .where(FieldNameNote.id, noteId)
      .first();
    if (dbResult === undefined) {
      throw new NotInDBError(
        `There is no note with id ${noteId}`,
        this.logger.getContext(),
        'isOwner',
      );
    }
    return dbResult[FieldNameNote.ownerId] === userId;
  }

  /**
   * Checks if the given user may create a note
   *
   * @param userId The id of the user
   * @param transaction Optional transaction to use
   * @returns true if the user may create a note, false otherwise
   */
  public async checkIfUserMayCreateNote(
    userId: number,
    transaction?: Knex,
  ): Promise<boolean> {
    const dbActor = transaction ? transaction : this.knex;
    const isRegisteredUser = await this.userService.isRegisteredUser(
      userId,
      dbActor,
    );
    if (isRegisteredUser) {
      // Registered users may always create notes
      return true;
    }

    // Full permission level is required for guests to create notes
    const maxGuestPermission = this.noteConfig.permissions.maxGuestLevel;
    return maxGuestPermission === PermissionLevel.FULL;
  }

  /**
   * Determines the {@link PermissionLevel} of the user on the given note.
   *
   * @param userId The user whose permission should be checked
   * @param noteId The note that is accessed by the given user
   * @returns The determined permission level
   */
  public async determinePermission(
    userId: number,
    noteId: number,
  ): Promise<PermissionLevel> {
    return await this.knex.transaction(async (transaction) => {
      if (await this.isOwner(userId, noteId, transaction)) {
        // If the user is the owner of the note, they have full permissions
        return PermissionLevel.FULL;
      }
      const userPermission = await this.determineNotePermissionLevelForUser(
        userId,
        noteId,
        transaction,
      );
      if (userPermission === PermissionLevel.WRITE) {
        // If the user is not the owner but has write permissions, this is already the highest permission level
        return userPermission;
      }
      const groupPermission =
        await this.determineHighestNotePermissionLevelOfGroups(
          userId,
          noteId,
          transaction,
        );
      const isRegisteredUser = await this.userService.isRegisteredUser(
        userId,
        transaction,
      );
      if (!isRegisteredUser) {
        const maxGuestPermission = this.noteConfig.permissions.maxGuestLevel;
        return maxGuestPermission > groupPermission
          ? maxGuestPermission
          : groupPermission;
      }
      return groupPermission > userPermission
        ? groupPermission
        : userPermission;
    });
  }

  /**
   * Determines the access level for a given user to a given note
   *
   * @param userId The id of the user who wants access
   * @param noteId The id of the note for which access is checked
   * @param transaction The optional database transaction to use
   * @returns The permission level of the user on the note
   */
  private async determineNotePermissionLevelForUser(
    userId: number,
    noteId: number,
    transaction?: Knex,
  ): Promise<PermissionLevel> {
    const dbActor = transaction ? transaction : this.knex;
    const userPermissions = await dbActor(TableNoteUserPermission)
      .select(FieldNameNoteUserPermission.canEdit)
      .where(FieldNameNoteUserPermission.noteId, noteId)
      .andWhere(FieldNameNoteUserPermission.userId, userId)
      .first();
    if (userPermissions === undefined) {
      return PermissionLevel.DENY;
    }
    return convertEditabilityToPermissionLevel(
      userPermissions[FieldNameNoteUserPermission.canEdit],
    );
  }

  /**
   * Determines the access level for the groups of a given user to a given note
   *
   * @param userId The id of the user who wants access
   * @param noteId The id of the note for which access is checked
   * @param transaction The optional database transaction to use
   * @returns The highest permission level of the groups of the user on the note
   */
  private async determineHighestNotePermissionLevelOfGroups(
    userId: number,
    noteId: number,
    transaction?: Knex,
  ): Promise<PermissionLevel> {
    const dbActor = transaction ? transaction : this.knex;

    // 1. Get all groups the user is member of
    const groupsOfUser = await dbActor(TableGroupUser)
      .select(FieldNameGroupUser.groupId)
      .where(FieldNameGroupUser.userId, userId);
    if (groupsOfUser === undefined) {
      // If the user is not a member of any group, they cannot have permissions
      return PermissionLevel.DENY;
    }
    const groupIds = groupsOfUser.map(
      (groupOfUser) => groupOfUser[FieldNameGroupUser.groupId],
    );

    // 2. Get all permissions on the note for groups the user is member of
    const groupPermissions = await dbActor(TableNoteGroupPermission)
      .select(FieldNameNoteGroupPermission.canEdit)
      .whereIn(FieldNameNoteGroupPermission.groupId, groupIds)
      .andWhere(FieldNameNoteGroupPermission.noteId, noteId);
    if (groupPermissions === undefined) {
      // If there are no permissions for the groups, the user cannot have permissions
      return PermissionLevel.DENY;
    }

    const permissionLevels = groupPermissions.map((permission) =>
      convertEditabilityToPermissionLevel(
        permission[FieldNameNoteGroupPermission.canEdit],
      ),
    );
    return Math.max(...permissionLevels);
  }

  /**
   * Broadcasts a permission change event for the given note id
   *
   * @param noteId The id of the note for which permissions changed
   */
  private notifyOthers(noteId: number): void {
    this.eventEmitter.emit(NoteEvent.PERMISSION_CHANGE, noteId);
  }

  /**
   * Sets permission for a specific user on a note
   *
   * @param noteId the id of the note
   * @param userId the user for which the permission should be set
   * @param canEdit specifies if the user can edit the note
   */
  async setUserPermission(
    noteId: number,
    userId: number,
    canEdit: boolean,
  ): Promise<void> {
    const isOwner = await this.isOwner(userId, noteId);
    if (isOwner) {
      // If the user is the owner, they always have full permissions
      return;
    }
    await this.knex.transaction(async (transaction) => {
      const isRegisteredUser = await this.userService.isRegisteredUser(
        userId,
        transaction,
      );
      if (!isRegisteredUser) {
        throw new PermissionError(
          'Note permissions can not be granted to guests',
          this.logger.getContext(),
          'setUserPermission',
        );
      }
      await this.knex(TableNoteUserPermission)
        .insert({
          [FieldNameNoteUserPermission.userId]: userId,
          [FieldNameNoteUserPermission.noteId]: noteId,
          [FieldNameNoteUserPermission.canEdit]: canEdit,
        })
        .onConflict([
          FieldNameNoteUserPermission.noteId,
          FieldNameNoteUserPermission.userId,
        ])
        .merge();
      this.notifyOthers(noteId);
    });
  }

  /**
   * Removes permission for a specific user on a note
   *
   * @param noteId the id of the note
   * @param userId the userId for which the permission should be removed
   * @throws NotInDBError if the user did not have the permission already
   */
  async removeUserPermission(noteId: number, userId: number): Promise<void> {
    const result = await this.knex(TableNoteUserPermission)
      .where(FieldNameNoteUserPermission.noteId, noteId)
      .andWhere(FieldNameNoteUserPermission.userId, userId)
      .delete();
    if (result !== 1) {
      throw new NotInDBError(
        `The user does not have a permission on this note.`,
        this.logger.getContext(),
        'removeUserPermission',
      );
    }
    this.notifyOthers(noteId);
  }

  /**
   * Sets permission for a specific group on a note
   *
   * @param noteId the id of the note
   * @param groupId the name of the group for which the permission should be set
   * @param canEdit specifies if the group can edit the note
   * @param transaction The optional transaction for the database
   */
  async setGroupPermission(
    noteId: number,
    groupId: number,
    canEdit: boolean,
    transaction?: Knex,
  ): Promise<void> {
    const dbActor = transaction ?? this.knex;
    await dbActor(TableNoteGroupPermission)
      .insert({
        [FieldNameNoteGroupPermission.groupId]: groupId,
        [FieldNameNoteGroupPermission.noteId]: noteId,
        [FieldNameNoteGroupPermission.canEdit]: canEdit,
      })
      .onConflict([
        FieldNameNoteGroupPermission.noteId,
        FieldNameNoteGroupPermission.groupId,
      ])
      .merge();
    this.notifyOthers(noteId);
  }

  /**
   * Removes permission for a specific group on a note
   *
   * @param noteId the id of the note
   * @param groupId the group for which the permission should be removed
   * @returns the note with the new permission
   */
  async removeGroupPermission(noteId: number, groupId: number): Promise<void> {
    const result = await this.knex(TableNoteGroupPermission)
      .where(FieldNameNoteGroupPermission.noteId, noteId)
      .andWhere(FieldNameNoteGroupPermission.groupId, groupId)
      .delete();
    if (result !== 1) {
      throw new NotInDBError(
        `The group does not have a permission on this note.`,
        this.logger.getContext(),
        'removeGroupPermission',
      );
    }
    this.notifyOthers(noteId);
  }

  /**
   * Updates the owner of a note
   *
   * @param noteId the id of note to update
   * @param newOwnerId the id of the new owner
   * @throws NotInDBError if the new owner or the note does not exist
   */
  async changeOwner(noteId: number, newOwnerId: number): Promise<void> {
    const result = await this.knex(TableNote)
      .update({
        [FieldNameNote.ownerId]: newOwnerId,
      })
      .where(FieldNameNote.id, noteId);
    if (result !== 1) {
      throw new NotInDBError(
        'The user id of the new owner or the note id does not exist',
      );
    }
    this.notifyOthers(noteId);
  }

  /**
   * Gets the permissions for a note
   *
   * @param noteId the id of the note
   * @returns a NotePermissionsDto containing the permissions for the note
   * @throws GenericDBError if the database state is invalid
   */
  async getPermissionsDtoForNote(noteId: number): Promise<NotePermissionsDto> {
    return await this.knex.transaction(async (transaction) => {
      const owner = await transaction(TableNote)
        .join(
          TableUser,
          `${TableUser}.${FieldNameUser.id}`,
          `${TableNote}.${FieldNameNote.ownerId}`,
        )
        .select<{
          [FieldNameUser.username]: string;
        }>(`${TableUser}.${FieldNameUser.username}`)
        .where(FieldNameNote.id, noteId)
        .first();

      const userPermissions = await transaction(TableNoteUserPermission)
        .join(
          TableUser,
          `${TableUser}.${FieldNameUser.id}`,
          `${TableNoteUserPermission}.${FieldNameNoteUserPermission.userId}`,
        )
        .select<
          {
            [FieldNameUser.username]: string;
            [FieldNameNoteUserPermission.canEdit]: boolean;
          }[]
        >(
          `${TableUser}.${FieldNameUser.username}`,
          `${TableNoteUserPermission}.${FieldNameNoteUserPermission.canEdit}`,
        )
        .where(FieldNameNoteUserPermission.noteId, noteId);

      const groupPermissions = await transaction(TableNoteGroupPermission)
        .join(
          TableGroup,
          `${TableGroup}.${FieldNameGroup.id}`,
          `${TableNoteGroupPermission}.${FieldNameNoteGroupPermission.groupId}`,
        )
        .select<
          {
            [FieldNameGroup.name]: string;
            [FieldNameNoteGroupPermission.canEdit]: boolean;
          }[]
        >(
          `${TableGroup}.${FieldNameGroup.name}`,
          `${TableNoteGroupPermission}.${FieldNameNoteGroupPermission.canEdit}`,
        )
        .where(FieldNameNoteGroupPermission.noteId, noteId);

      if (
        owner === undefined ||
        userPermissions === undefined ||
        groupPermissions === undefined
      ) {
        throw new GenericDBError(
          'Invalid database state. This should not happen.',
          this.logger.getContext(),
          'getPermissionsForNote',
        );
      }

      return {
        owner: owner[FieldNameUser.username],
        sharedToUsers: userPermissions.map((userPermission) => ({
          username: userPermission[FieldNameUser.username],
          canEdit: userPermission[FieldNameNoteUserPermission.canEdit],
        })),
        sharedToGroups: groupPermissions.map((groupPermission) => ({
          groupName: groupPermission[FieldNameGroup.name],
          canEdit: groupPermission[FieldNameNoteGroupPermission.canEdit],
        })),
      };
    });
  }
}
