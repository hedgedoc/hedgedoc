/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  NoteDto,
  NoteMetadataDto,
  NotePermissionsDto,
  SpecialGroup,
} from '@hedgedoc/commons';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { AliasService } from '../alias/alias.service';
import { DefaultAccessLevel } from '../config/default-access-level.enum';
import noteConfiguration, { NoteConfig } from '../config/note.config';
import {
  FieldNameAlias,
  FieldNameNote,
  Note,
  TableAlias,
  TableNote,
  User,
} from '../database/types';
import {
  ForbiddenIdError,
  GenericDBError,
  MaximumDocumentLengthExceededError,
  NotInDBError,
} from '../errors/errors';
import { NoteEventMap } from '../events';
import { GroupsService } from '../groups/groups.service';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { PermissionService } from '../permissions/permission.service';
import { RealtimeNoteStore } from '../realtime/realtime-note/realtime-note-store';
import { RealtimeNoteService } from '../realtime/realtime-note/realtime-note.service';
import { RevisionsService } from '../revisions/revisions.service';
import { UsersService } from '../users/users.service';
import { getPrimaryAlias } from './utils';

@Injectable()
export class NoteService {
  constructor(
    @InjectConnection()
    private readonly knex: Knex,

    private readonly logger: ConsoleLoggerService,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(GroupsService) private groupsService: GroupsService,
    private revisionsService: RevisionsService,
    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
    @Inject(AliasService)
    private aliasService: AliasService,
    @Inject(PermissionService) private permissionService: PermissionService,
    private realtimeNoteService: RealtimeNoteService,
    private realtimeNoteStore: RealtimeNoteStore,
    private eventEmitter: EventEmitter2<NoteEventMap>,
  ) {
    this.logger.setContext(NoteService.name);
  }

  /**
   * Get all notes owned by a user
   *
   * @param userId The id of the user who owns the notes
   * @return Array of notes owned by the user
   */
  async getUserNotes(userId: number): Promise<Note[]> {
    // noinspection ES6RedundantAwait
    return await this.knex(TableNote)
      .select()
      .where(FieldNameNote.ownerId, userId);
  }

  /**
   * Creates a new note
   *
   * @param noteContent The content of the new note, in most cases an empty string
   * @param givenAlias An optional alias the note should have
   * @param ownerUserId The owner of the note
   * @return The newly created note
   * @throws {AlreadyInDBError} a note with the requested id or aliases already exists
   * @throws {ForbiddenIdError} the requested id or aliases is forbidden
   * @throws {MaximumDocumentLengthExceededError} the noteContent is longer than the maxDocumentLength
   * @thorws {GenericDBError} the database returned a non-expected value
   */
  async createNote(
    noteContent: string,
    ownerUserId: number,
    givenAlias?: string,
  ): Promise<number> {
    // Check if new note doesn't violate application constraints
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
        transaction,
      );

      const isUserRegistered = await this.usersService.isRegisteredUser(
        ownerUserId,
        transaction,
      );

      const everyoneAccessLevel = isUserRegistered
        ? // Use the default access level from the config for registered users
          this.noteConfig.permissions.default.everyone
        : // If the owner is a guest, this is an anonymous note
          // Anonymous notes are always writeable by everyone
          DefaultAccessLevel.WRITE;

      const loggedInUsersAccessLevel =
        this.noteConfig.permissions.default.loggedIn;

      await this.permissionService.setGroupPermission(
        noteId,
        SpecialGroup.EVERYONE,
        everyoneAccessLevel,
        transaction,
      );

      await this.permissionService.setGroupPermission(
        noteId,
        SpecialGroup.LOGGED_IN,
        loggedInUsersAccessLevel,
        transaction,
      );

      return noteId;
    });
  }

  /**
   * Get the current content of the note.
   * @param noteId the note to use
   * @throws {NotInDBError} the note is not in the DB
   * @return {string} the content of the note
   */
  async getNoteContent(noteId: Note[FieldNameNote.id]): Promise<string> {
    const realtimeContent = this.realtimeNoteStore
      .find(noteId)
      ?.getRealtimeDoc()
      .getCurrentContent();
    if (realtimeContent) {
      return realtimeContent;
    }

    const latestRevision =
      await this.revisionsService.getLatestRevision(noteId);
    return latestRevision.content;
  }

  /**
   * Get a note by either their id or aliases.
   * @param alias the notes id or aliases
   * @throws {NotInDBError} there is no note with this id or aliases
   * @throws {ForbiddenIdError} the requested id or aliases is forbidden
   * @return the note id
   */
  async getNoteIdByAlias(alias: string, transaction?: Knex): Promise<number> {
    const dbActor = transaction ?? this.knex;
    const isForbidden = this.aliasService.isAliasForbidden(alias);
    if (isForbidden) {
      throw new ForbiddenIdError(
        `The note id or alias '${alias}' is forbidden by the administrator.`,
      );
    }

    this.logger.debug(`Trying to find note '${alias}'`, 'getNoteIdByAlias');

    /**
     * This query gets the note's aliases, owner, groupPermissions (and the groups), userPermissions (and the users) and tags and
     * then only gets the note, that either has a publicId :noteIdOrAlias or has any aliases with this name.
     **/
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
   * Get all users that ever appeared as an author for the given note
   * @param note The note to search authors for
   */
  async getAuthorUsers(note: Note): Promise<User[]> {
    // return await this.userRepository
    //   .createQueryBuilder('user')
    //   .innerJoin('user.authors', 'author')
    //   .innerJoin('author.edits', 'edit')
    //   .innerJoin('edit.revisions', 'revision')
    //   .innerJoin('revision.note', 'note')
    //   .where('note.id = :id', { id: note.id })
    //   .getMany();
    return [];
  }

  /**
   * Deletes a note
   *
   * @param noteId If of the note to delete
   * @throws {NotInDBError} if there is no note with this id
   */
  async deleteNote(noteId: Note[FieldNameNote.id]): Promise<void> {
    const numberOfDeletedNotes = await this.knex(TableNote)
      .where(FieldNameNote.id, noteId)
      .delete();
    if (numberOfDeletedNotes === 0) {
      throw new NotInDBError(
        `There is no note with the id '${noteId}' to delete.`,
      );
    }
  }

  /**
   *
   * Update the content of a note
   *
   * @param noteId - the note
   * @param noteContent - the new content
   * @return the note with a new revision and new content
   * @throws {NotInDBError} there is no note with this id or aliases
   */
  async updateNote(noteId: number, noteContent: string): Promise<void> {
    // TODO Disconnect realtime clients first
    await this.revisionsService.createRevision(noteId, noteContent);
    // TODO Reload realtime note
  }

  /**
   * @async
   * Calculate the updateUser (for the NoteDto) for a Note.
   * @param {Note} noteId - the note to use
   * @return {User} user to be used as updateUser in the NoteDto
   */
  async getLastUpdatedNoteUser(noteId: number): Promise<number> {
    const lastRevision = await this.revisionsService.getLatestRevision(noteId);
    // const edits = await lastRevision.edits;
    // if (edits.length > 0) {
    //   // Sort the last Revisions Edits by their updatedAt Date to get the latest one
    //   // the user of that Edit is the updateUser
    //   return await (
    //     await edits.sort(
    //       (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    //     )[0].author
    //   ).user;
    // }
    // // If there are no Edits, the owner is the updateUser
    // return await noteId.owner;
    return 0;
  }

  /**
   * Build NotePermissionsDto from a note.
   * @param {Note} note - the note to use
   * @return {NotePermissionsDto} the built NotePermissionDto
   */
  async toNotePermissionsDto(noteId: number): Promise<NotePermissionsDto> {
    const owner = await note.owner;
    const userPermissions = await note.userPermissions;
    const groupPermissions = await note.groupPermissions;
    return {
      owner: owner ? owner.username : null,
      sharedToUsers: await Promise.all(
        userPermissions.map(async (noteUserPermission) => ({
          username: (await noteUserPermission.user).username,
          canEdit: noteUserPermission.canEdit,
        })),
      ),
      sharedToGroups: await Promise.all(
        groupPermissions.map(async (noteGroupPermission) => ({
          groupName: (await noteGroupPermission.group).name,
          canEdit: noteGroupPermission.canEdit,
        })),
      ),
    };
  }

  /**
   * @async
   * Build NoteMetadataDto from a note.
   * @param {Note} note - the note to use
   * @return {NoteMetadataDto} the built NoteMetadataDto
   */
  async toNoteMetadataDto(note: Note): Promise<NoteMetadataDto> {
    const updateUser = await this.getLastUpdatedNoteUser(note);
    const latestRevision = await this.revisionsService.getLatestRevision(note);
    return {
      id: note.publicId,
      aliases: await Promise.all(
        (await note.aliases).map((alias) =>
          this.aliasService.toAliasDto(alias, note),
        ),
      ),
      primaryAddress: (await getPrimaryAlias(note)) ?? note.publicId,
      title: latestRevision.title,
      description: latestRevision.description,
      tags: (await latestRevision.tags).map((tag) => tag.name),
      createdAt: note.createdAt,
      editedBy: (await this.getAuthorUsers(note)).map((user) => user.username),
      permissions: await this.toNotePermissionsDto(note),
      version: note.version,
      updatedAt: latestRevision.createdAt,
      updateUsername: updateUser ? updateUser.username : null,
      viewCount: note.viewCount,
    };
  }

  /**
   * @async
   * Build NoteDto from a note.
   * @param {Note} note - the note to use
   * @return {NoteDto} the built NoteDto
   */
  async toNoteDto(note: Note): Promise<NoteDto> {
    return {
      content: await this.getNoteContent(note),
      metadata: await this.toNoteMetadataDto(note),
      editedByAtPosition: [],
    };
  }
}
