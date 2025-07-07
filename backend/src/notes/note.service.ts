/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  NoteDto,
  NoteMetadataDto,
  NotePermissionsDto,
  PermissionLevel,
  SpecialGroup,
} from '@hedgedoc/commons';
import {
  FieldNameAlias,
  FieldNameGroup,
  FieldNameNote,
  FieldNameNoteGroupPermission,
  FieldNameNoteUserPermission,
  FieldNameRevision,
  FieldNameUser,
  Group,
  Note,
  NoteGroupPermission,
  NoteUserPermission,
  TableAlias,
  TableGroup,
  TableNote,
  TableNoteGroupPermission,
  TableNoteUserPermission,
  TableUser,
  User,
} from '@hedgedoc/database';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { AliasService } from '../alias/alias.service';
import noteConfiguration, { NoteConfig } from '../config/note.config';
import {
  ForbiddenIdError,
  GenericDBError,
  MaximumDocumentLengthExceededError,
  NotInDBError,
} from '../errors/errors';
import { NoteEvent, NoteEventMap } from '../events';
import { GroupsService } from '../groups/groups.service';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { PermissionService } from '../permissions/permission.service';
import { RealtimeNoteStore } from '../realtime/realtime-note/realtime-note-store';
import { RevisionsService } from '../revisions/revisions.service';

@Injectable()
export class NoteService {
  constructor(
    @InjectConnection()
    private readonly knex: Knex,

    private readonly logger: ConsoleLoggerService,
    @Inject(GroupsService) private groupsService: GroupsService,
    private revisionsService: RevisionsService,
    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
    @Inject(AliasService)
    private aliasService: AliasService,
    @Inject(forwardRef(() => PermissionService))
    private permissionService: PermissionService,
    private realtimeNoteStore: RealtimeNoteStore,
    private eventEmitter: EventEmitter2<NoteEventMap>,
  ) {
    this.logger.setContext(NoteService.name);
  }

  /**
   * Get all notes owned by a user
   *
   * @param userId The id of the user who owns the notes
   * @returns Array of notes owned by the user
   */
  async getUserNoteIds(userId: number): Promise<number[]> {
    const result = await this.knex(TableNote)
      .select(FieldNameNote.id)
      .where(FieldNameNote.ownerId, userId);
    return result.map((row) => row[FieldNameNote.id]);
  }

  /**
   * Creates a new note
   *
   * @param noteContent The content of the new note, in most cases an empty string
   * @param givenAlias An optional alias the note should have
   * @param ownerUserId The owner of the note
   * @returns The newly created note
   * @throws AlreadyInDBError if a note with the requested id or aliases already exists
   * @throws ForbiddenIdError if the requested id or aliases is forbidden
   * @throws MaximumDocumentLengthExceededError if the noteContent is longer than the maxDocumentLength
   * @throws GenericDBError if the database returned a non-expected value
   */
  async createNote(
    noteContent: string,
    ownerUserId: number,
    givenAlias?: string,
  ): Promise<number> {
    // Ensures that a new note doesn't violate application constraints
    if (noteContent.length > this.noteConfig.maxDocumentLength) {
      throw new MaximumDocumentLengthExceededError();
    }
    return await this.knex.transaction(async (transaction) => {
      // Create note itself in the database
      const createdNotes = await transaction(TableNote).insert(
        {
          [FieldNameNote.ownerId]: ownerUserId,
          [FieldNameNote.version]: 2,
        },
        [FieldNameNote.id],
      );

      if (createdNotes.length !== 1) {
        throw new GenericDBError(
          'The note could not be created in the database',
          this.logger.getContext(),
          'createNote',
        );
      }

      const noteId = createdNotes[0][FieldNameNote.id];

      if (givenAlias !== undefined) {
        await this.aliasService.ensureAliasIsAvailable(givenAlias, transaction);
      }
      const newAlias =
        givenAlias === undefined
          ? this.aliasService.generateRandomAlias()
          : givenAlias;
      await this.aliasService.addAlias(noteId, newAlias, transaction);

      await this.revisionsService.createRevision(
        noteId,
        noteContent,
        true,
        transaction,
      );

      const everyoneDefaultAccessLevel =
        this.noteConfig.permissions.default.everyone;
      const loggedInUsersDefaultAccessLevel =
        this.noteConfig.permissions.default.loggedIn;

      if (everyoneDefaultAccessLevel !== PermissionLevel.DENY) {
        const everyoneAccessGroupId = await this.groupsService.getGroupIdByName(
          SpecialGroup.EVERYONE,
          transaction,
        );
        await this.permissionService.setGroupPermission(
          noteId,
          everyoneAccessGroupId,
          everyoneDefaultAccessLevel === PermissionLevel.WRITE,
          transaction,
        );
      }

      if (loggedInUsersDefaultAccessLevel !== PermissionLevel.DENY) {
        const loggedInUsersAccessGroupId =
          await this.groupsService.getGroupIdByName(
            SpecialGroup.LOGGED_IN,
            transaction,
          );
        await this.permissionService.setGroupPermission(
          noteId,
          loggedInUsersAccessGroupId,
          loggedInUsersDefaultAccessLevel === PermissionLevel.WRITE,
          transaction,
        );
      }

      return noteId;
    });
  }

  /**
   * Gets the current content of the note
   *
   * @param noteId the note to use
   * @param transaction The optional database transaction to use
   * @returns the content of the note
   * @throws NotInDBError the note is not found in the database
   */
  async getNoteContent(noteId: number, transaction?: Knex): Promise<string> {
    const realtimeContent = this.realtimeNoteStore
      .find(noteId)
      ?.getRealtimeDoc()
      .getCurrentContent();
    if (realtimeContent) {
      return realtimeContent;
    }

    const latestRevision = await this.revisionsService.getLatestRevision(
      noteId,
      transaction,
    );
    return latestRevision.content;
  }

  /**
   * Gets a note's id by their aliases
   *
   * @param alias the alias
   * @param transaction The optional database transaction to use
   * @returns the note id
   * @throws NotInDBError if there is no note with this alias
   * @throws ForbiddenIdError if the requested note with the alias is forbidden
   */
  async getNoteIdByAlias(alias: string, transaction?: Knex): Promise<number> {
    const dbActor = transaction ?? this.knex;
    const isForbidden = this.aliasService.isAliasForbidden(alias);
    if (isForbidden) {
      throw new ForbiddenIdError(
        `The note id or alias '${alias}' is forbidden by the administrator.`,
      );
    }

    const note = await dbActor(TableAlias)
      .select<Pick<Note, FieldNameNote.id>>(`${TableNote}.${FieldNameNote.id}`)
      .where(FieldNameAlias.alias, alias)
      .join(
        TableNote,
        `${TableAlias}.${FieldNameAlias.noteId}`,
        `${TableNote}.${FieldNameNote.id}`,
      )
      .first();

    if (note === undefined) {
      const message = `Could not find note '${alias}'`;
      this.logger.debug(message, 'getNoteIdByAlias');
      throw new NotInDBError(message);
    }
    this.logger.debug(`Found note '${alias}'`, 'getNoteIdByAlias');
    return note[FieldNameNote.id];
  }

  /**
   * Deletes a note
   *
   * @param noteId Id of the note to delete
   * @throws NotInDBError if there is no note with this id
   */
  async deleteNote(noteId: Note[FieldNameNote.id]): Promise<void> {
    this.eventEmitter.emit(NoteEvent.DELETION, noteId);
    const numberOfDeletedNotes = await this.knex(TableNote)
      .where(FieldNameNote.id, noteId)
      .delete();
    if (numberOfDeletedNotes === 0) {
      throw new NotInDBError(`There is no note with the to delete.`);
    }
  }

  /**
   * Updates the content of a note
   * The realtime connection is closed in beforehand to ensure that realtime editing does not interfere with the update
   *
   * @param noteId the note id
   * @param noteContent the new content
   * @throws NotInDBError if there is no note with this id or aliases
   */
  async updateNote(noteId: number, noteContent: string): Promise<void> {
    this.eventEmitter.emit(NoteEvent.CLOSE_REALTIME, noteId);
    await this.revisionsService.createRevision(noteId, noteContent);
  }

  /**
   * Builds a NotePermissionsDto for a note
   * This method is a wrapper around the innerToNotePermissionsDto method to ensure a single transaction is used
   *
   * @param noteId The id of the note to get the permissions for
   * @param transaction The optional database transaction to use
   * @returns The built NotePermissionDto
   */
  async toNotePermissionsDto(
    noteId: number,
    transaction?: Knex,
  ): Promise<NotePermissionsDto> {
    if (transaction === undefined) {
      return await this.knex.transaction(async (newTransaction) => {
        return await this.innerToNotePermissionsDto(noteId, newTransaction);
      });
    }
    return await this.innerToNotePermissionsDto(noteId, transaction);
  }

  /**
   * Builds a NotePermissionsDto for a note
   *
   * @param noteId The id of the note to get the permissions for
   * @param transaction The database transaction to use
   * @returns The built NotePermissionDto
   * @throws NotInDBError if the note does not exist
   */
  private async innerToNotePermissionsDto(
    noteId: number,
    transaction: Knex,
  ): Promise<NotePermissionsDto> {
    const ownerUsername = await transaction(TableNote)
      .join(
        TableUser,
        `${TableNote}.${FieldNameNote.ownerId}`,
        `${TableUser}.${FieldNameUser.id}`,
      )
      .select<
        Pick<User, FieldNameUser.username>
      >(`${TableUser}.${FieldNameUser.username}`)
      .where(`${TableNote}.${FieldNameNote.id}`, noteId)
      .first();
    if (ownerUsername === undefined) {
      throw new NotInDBError(
        `The note does not exist.`,
        this.logger.getContext(),
        'toNotePermissionsDto',
      );
    }
    const userPermissions = await transaction(TableNoteUserPermission)
      .join(
        TableUser,
        `${TableNoteUserPermission}.${FieldNameNoteUserPermission.userId}`,
        `${TableUser}.${FieldNameUser.id}`,
      )
      .select<
        ({ [FieldNameUser.username]: string } & Pick<
          NoteUserPermission,
          FieldNameNoteUserPermission.canEdit
        >)[]
      >(`${TableUser}.${FieldNameUser.username}`, `${TableNoteUserPermission}.${FieldNameNoteUserPermission.canEdit}`)
      .whereNotNull(`${TableUser}.${FieldNameUser.username}`)
      .andWhere(
        `${TableNoteUserPermission}.${FieldNameNoteUserPermission.noteId}`,
        noteId,
      );
    const groupPermissions = await transaction(TableNoteGroupPermission)
      .join(
        TableGroup,
        `${TableNoteGroupPermission}.${FieldNameNoteGroupPermission.groupId}`,
        `${TableGroup}.${FieldNameGroup.id}`,
      )
      .select<
        (Pick<Group, FieldNameGroup.name> &
          Pick<NoteGroupPermission, FieldNameNoteGroupPermission.canEdit>)[]
      >(`${TableGroup}.${FieldNameGroup.name}`, `${TableNoteGroupPermission}.${FieldNameNoteGroupPermission.canEdit}`)
      .where(
        `${TableNoteGroupPermission}.${FieldNameNoteGroupPermission.noteId}`,
        noteId,
      );

    return {
      owner: ownerUsername[FieldNameUser.username],
      sharedToUsers: userPermissions.map((noteUserPermission) => ({
        username: noteUserPermission[FieldNameUser.username],
        canEdit: noteUserPermission[FieldNameNoteUserPermission.canEdit],
      })),
      sharedToGroups: groupPermissions.map((noteGroupPermission) => ({
        groupName: noteGroupPermission[FieldNameGroup.name],
        canEdit: noteGroupPermission[FieldNameNoteGroupPermission.canEdit],
      })),
    };
  }

  /**
   * Builds a NoteMetadataDto for a note
   * This method is a wrapper around the innerToNoteMetadataDto method to ensure a single transaction is used
   *
   * @param noteId The id of the note to get the metadata for
   * @param transaction The optional database transaction to use
   * @returns The built NoteMetadataDto
   */
  async toNoteMetadataDto(
    noteId: number,
    transaction?: Knex,
  ): Promise<NoteMetadataDto> {
    if (transaction === undefined) {
      return await this.knex.transaction(async (newTransaction) => {
        return await this.innerToNoteMetadataDto(noteId, newTransaction);
      });
    }
    return await this.innerToNoteMetadataDto(noteId, transaction);
  }

  /**
   * Builds a NoteMetadataDto for a note
   *
   * @param noteId The id of the note to get the metadata for
   * @param transaction The database transaction to use
   * @returns The built NoteMetadataDto
   * @throws NotInDBError if the note does not exist or has no primary alias
   */
  private async innerToNoteMetadataDto(
    noteId: number,
    transaction: Knex,
  ): Promise<NoteMetadataDto> {
    const aliases = await this.aliasService.getAllAliases(noteId, transaction);
    const primaryAlias = aliases.find(
      (alias) => alias[FieldNameAlias.isPrimary],
    );
    if (primaryAlias === undefined) {
      throw new NotInDBError(
        'The note has no primary alias.',
        this.logger.getContext(),
        'toNoteMetadataDto',
      );
    }
    const note = await transaction(TableNote)
      .select(FieldNameNote.createdAt, FieldNameNote.version)
      .where(FieldNameNote.id, noteId)
      .first();
    if (note === undefined) {
      throw new NotInDBError(
        `The note '${primaryAlias[FieldNameAlias.alias]}' does not exist.`,
        this.logger.getContext(),
        'toNoteMetadataDto',
      );
    }
    const createdAtString = note[FieldNameNote.createdAt];
    const version = note[FieldNameNote.version];
    this.logger.debug(`createdAt: ${createdAtString}`);
    this.logger.debug(`createversion: ${version}`);
    const createdAt = new Date(createdAtString).toISOString();

    const latestRevision = await this.revisionsService.getLatestRevision(
      noteId,
      transaction,
    );
    const tags = await this.revisionsService.getTagsByRevisionUuid(
      latestRevision[FieldNameRevision.uuid],
      transaction,
    );
    const permissions = await this.toNotePermissionsDto(noteId, transaction);

    const updateUsers = await this.revisionsService.getRevisionUserInfo(
      latestRevision[FieldNameRevision.uuid],
      transaction,
    );
    updateUsers.users.sort();

    let lastUpdatedBy;
    let editedBy;
    let updatedAt;
    if (updateUsers.users.length > 0) {
      const lastEdit = updateUsers.users[0];
      lastUpdatedBy = lastEdit.username;
      editedBy = updateUsers.users.map((user) => user.username);
      updatedAt = new Date(lastEdit.createdAt).toISOString();
    } else {
      lastUpdatedBy = permissions.owner;
      editedBy = permissions.owner ? [permissions.owner] : [];
      updatedAt = createdAt;
    }

    return {
      aliases: aliases.map((alias) => alias[FieldNameAlias.alias]),
      primaryAlias: primaryAlias[FieldNameAlias.alias],
      title: latestRevision.title,
      description: latestRevision.description,
      tags,
      createdAt,
      editedBy,
      permissions,
      version,
      updatedAt,
      lastUpdatedBy,
    };
  }

  /**
   * Gets the note data for the note DTO
   *
   * @param noteId The id of the note to transform
   * @returns The built NoteDto
   */
  async toNoteDto(noteId: number): Promise<NoteDto> {
    return await this.knex.transaction(async (transaction) => {
      return {
        content: await this.getNoteContent(noteId, transaction),
        metadata: await this.toNoteMetadataDto(noteId, transaction),
        editedByAtPosition: [],
      };
    });
  }
}
