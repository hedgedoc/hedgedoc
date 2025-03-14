/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  NotePermissionsDto,
  PermissionLevel,
  SpecialGroup,
} from '@hedgedoc/commons';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import noteConfiguration, { NoteConfig } from '../config/note.config';
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
} from '../database/types';
import { GenericDBError, NotInDBError } from '../errors/errors';
import { NoteEvent, NoteEventMap } from '../events';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { NotePermissionLevel } from './note-permission.enum';
import { convertEditabilityToPermissionLevel } from './utils/convert-editability-to-note-permission-level';
import { convertPermissionLevelToNotePermissionLevel } from './utils/convert-guest-access-to-note-permission-level';

@Injectable()
export class PermissionService {
  constructor(
    @InjectConnection()
    private readonly knex: Knex,

    private readonly logger: ConsoleLoggerService,

    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,

    private eventEmitter: EventEmitter2<NoteEventMap>,
  ) {}

  /**
   * Checks whether a given user has the permission to remove a given upload
   *
   * @param userId The id of the user who wants to delete an upload
   * @param mediaUploadUuid The uuid of the upload
   */
  public async checkMediaDeletePermission(
    userId: number,
    mediaUploadUuid: string,
  ): Promise<boolean> {
    const mediaUploadAndNote = await this.knex(TableMediaUpload)
      .join(
        TableNote,
        `${TableMediaUpload}.${FieldNameMediaUpload.noteId}`,
        '=',
        `${TableNote}.${FieldNameNote.id}`,
      )
      .select(FieldNameMediaUpload.userId, FieldNameNote.ownerId)
      .where(FieldNameMediaUpload.uuid, mediaUploadUuid)
      .first();

    if (!mediaUploadAndNote) {
      throw new NotInDBError(
        `There is no upload with the id ${mediaUploadUuid}`,
        this.logger.getContext(),
        'checkMediaDeletePermission',
      );
    }

    return (
      mediaUploadAndNote[FieldNameMediaUpload.userId] === userId ||
      mediaUploadAndNote[FieldNameNote.ownerId] === userId
    );
  }

  /**
   * Checks if the given {@link User} is allowed to create notes.
   *
   * @param username - The user whose permission should be checked. Value is null if guest access should be checked
   * @return if the user is allowed to create notes
   */
  public mayCreate(username: string | null): boolean {
    return (
      username !== null ||
      this.noteConfig.guestAccess === PermissionLevel.CREATE
    );
  }

  /**
   * Checks if the given {@link User} is the owner of a note
   *
   * @param userId The id of the user
   * @param noteId The id of the note
   * @param transaction Optional transaction to use
   * @return true if the user is the owner of the note
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
    const ownerId = await dbActor(TableNote)
      .select(FieldNameNote.ownerId)
      .where(FieldNameNote.id, noteId)
      .first();
    if (ownerId === undefined) {
      throw new NotInDBError(
        `There is no note with id ${noteId}`,
        this.logger.getContext(),
        'isOwner',
      );
    }
    return ownerId[FieldNameNote.ownerId] === userId;
  }

  /**
   * Determines the {@link NotePermission permission} of the user on the given {@link Note}.
   *
   * @param {number | null} userId The user whose permission should be checked
   * @param {number} noteId The note that is accessed by the given user
   * @return {Promise<NotePermissionLevel>} The determined permission
   */
  public async determinePermission(
    userId: number,
    noteId: number,
  ): Promise<NotePermissionLevel> {
    return await this.knex.transaction(async (transaction) => {
      if (await this.isOwner(userId, noteId, transaction)) {
        return NotePermissionLevel.OWNER;
      }
      const userPermission = await this.determineNotePermissionLevelForUser(
        userId,
        noteId,
        transaction,
      );
      if (userPermission === NotePermissionLevel.WRITE) {
        return userPermission;
      }
      const groupPermission =
        await this.determineHighestNotePermissionLevelOfGroups(
          userId,
          noteId,
          transaction,
        );
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
   * @private
   */
  private async determineNotePermissionLevelForUser(
    userId: number,
    noteId: number,
    transaction?: Knex,
  ): Promise<NotePermissionLevel> {
    const dbActor = transaction ? transaction : this.knex;
    const userPermissions = await dbActor(TableNoteUserPermission)
      .select(FieldNameNoteUserPermission.canEdit)
      .where(FieldNameNoteUserPermission.noteId, noteId)
      .andWhere(FieldNameNoteUserPermission.userId, userId)
      .first();
    if (userPermissions === undefined) {
      return NotePermissionLevel.DENY;
    }
    return convertEditabilityToPermissionLevel(
      userPermissions[FieldNameNoteUserPermission.canEdit],
    );
  }

  /**
   * Determines the access level for a given user to a given note
   *
   * @param userId The id of the user who wants access
   * @param noteId The id of the note for which access is checked
   * @param transaction The optional database transaction to use
   * @private
   */
  private async determineHighestNotePermissionLevelOfGroups(
    userId: number,
    noteId: number,
    transaction?: Knex,
  ): Promise<NotePermissionLevel> {
    const dbActor = transaction ? transaction : this.knex;

    // 1. Get all groups the user is member of
    const groupsOfUser = await dbActor(TableGroupUser)
      .select(FieldNameGroupUser.groupId)
      .where(FieldNameGroupUser.userId, userId);
    if (groupsOfUser === undefined) {
      return NotePermissionLevel.DENY;
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
      return NotePermissionLevel.DENY;
    }

    const permissionLevels = groupPermissions.map((permission) =>
      convertEditabilityToPermissionLevel(
        permission[FieldNameNoteGroupPermission.canEdit],
      ),
    );
    return Math.max(...permissionLevels);
  }

  /**
   * Determines whether guests have access to a note or not and if so with which level of permission
   * @param noteId The id of the note to check
   * @private
   */
  private async determineNotePermissionLevelForGuest(
    noteId: number,
  ): Promise<NotePermissionLevel> {
    if (this.noteConfig.guestAccess === PermissionLevel.DENY) {
      return NotePermissionLevel.DENY;
    }

    const everyonePermission = await this.knex(TableNoteGroupPermission)
      .select(FieldNameNoteGroupPermission.canEdit)
      .where(FieldNameNoteGroupPermission.noteId, noteId)
      .andWhere(FieldNameNoteGroupPermission.groupId, SpecialGroup.EVERYONE)
      .first();

    if (everyonePermission === undefined) {
      return NotePermissionLevel.DENY;
    }
    const notePermission = everyonePermission[
      FieldNameNoteGroupPermission.canEdit
    ]
      ? NotePermissionLevel.WRITE
      : NotePermissionLevel.READ;

    // Make sure we don't allow more permissions than allowed in the config, even if they come from the DB
    const configuredGuestNotePermissionLevel =
      convertPermissionLevelToNotePermissionLevel(this.noteConfig.guestAccess);
    return configuredGuestNotePermissionLevel < notePermission
      ? configuredGuestNotePermissionLevel
      : notePermission;
  }

  /**
   * Broadcasts a permission change event for the given note id
   * @param noteId The id of the note for which permissions changed
   * @private
   */
  private notifyOthers(noteId: number): void {
    this.eventEmitter.emit(NoteEvent.PERMISSION_CHANGE, noteId);
  }

  /**
   * Set permission for a specific user on a note.
   * @param noteId the note
   * @param userId the user for which the permission should be set
   * @param canEdit specifies if the user can edit the note
   * @return the note with the new permission
   */
  async setUserPermission(
    noteId: number,
    userId: number,
    canEdit: boolean,
  ): Promise<void> {
    if (await this.isOwner(userId, noteId)) {
      return;
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
  }

  /**
   * Remove permission for a specific user on a note.
   * @param noteId the note
   * @param userId - the userId for which the permission should be set
   * @throws NotInDBError if the user did not have the permission already
   */
  async removeUserPermission(noteId: number, userId: number): Promise<void> {
    const result = await this.knex(TableNoteUserPermission)
      .where(FieldNameNoteUserPermission.noteId, noteId)
      .andWhere(FieldNameNoteUserPermission.userId, userId)
      .delete();
    if (result !== 0) {
      throw new NotInDBError(
        `The user does not have a permission on this note.`,
        this.logger.getContext(),
        'removeUserPermission',
      );
    }
    this.notifyOthers(noteId);
  }

  /**
   * Set permission for a specific group on a note.
   * @param noteId - the if of the note
   * @param groupId - the name of the group for which the permission should be set
   * @param canEdit - specifies if the group can edit the note
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
   * Remove permission for a specific group on a note.
   * @param noteId - the note
   * @param groupId - the group for which the permission should be set
   * @return the note with the new permission
   */
  async removeGroupPermission(noteId: number, groupId: number): Promise<void> {
    const result = await this.knex(TableNoteGroupPermission)
      .where(FieldNameNoteGroupPermission.noteId, noteId)
      .andWhere(FieldNameNoteGroupPermission.groupId, groupId)
      .delete();
    if (result !== 0) {
      throw new NotInDBError(
        `The group does not have a permission on this note.`,
        this.logger.getContext(),
        'removeUserPermission',
      );
    }
    this.notifyOthers(noteId);
  }

  /**
   * Updates the owner of a note.
   * @param noteId - the note to use
   * @param newOwnerId - the new owner
   * @return the updated note
   */
  async changeOwner(noteId: number, newOwnerId: number): Promise<void> {
    const result = await this.knex(TableNote)
      .update({
        [FieldNameNote.ownerId]: newOwnerId,
      })
      .where(FieldNameNote.id, noteId);
    if (result === 0) {
      throw new NotInDBError(
        'The user id of the new owner or the note id does not exist',
      );
    }
    this.notifyOthers(noteId);
  }

  async getPermissionsForNote(noteId: number): Promise<NotePermissionsDto> {
    return await this.knex.transaction(async (transaction) => {
      const owner = (await transaction(TableNote)
        .join(
          TableUser,
          `${TableUser}.${FieldNameUser.id}`,
          `${TableNote}.${FieldNameNote.ownerId}`,
        )
        .select(`${TableUser}.${FieldNameUser.username}`)
        .where(FieldNameNote.id, noteId)
        .first()) as { [FieldNameUser.username]: string } | undefined;

      const userPermissions:
        | {
            [FieldNameUser.username]: string;
            [FieldNameNoteUserPermission.canEdit]: boolean;
          }[]
        | undefined = await transaction(TableNoteUserPermission)
        .join(
          TableUser,
          `${TableUser}.${FieldNameUser.id}`,
          `${TableNoteUserPermission}.${FieldNameNoteUserPermission.userId}`,
        )
        .select(
          `${TableUser}.${FieldNameUser.username}`,
          `${TableNoteUserPermission}.${FieldNameNoteUserPermission.canEdit}`,
        )
        .where(FieldNameNoteUserPermission.noteId, noteId);

      const groupPermissions:
        | {
            [FieldNameGroup.name]: string;
            [FieldNameNoteGroupPermission.canEdit]: boolean;
          }[]
        | undefined = await transaction(TableNoteGroupPermission)
        .join(
          TableGroup,
          `${TableGroup}.${FieldNameGroup.id}`,
          `${TableNoteGroupPermission}.${FieldNameNoteGroupPermission.groupId}`,
        )
        .select(
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
          'Invalid Database State. This should not happen.',
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
