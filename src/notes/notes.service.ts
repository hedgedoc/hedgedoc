/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Optional } from '@mrdrogdrog/optional';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DefaultAccessPermission } from '../config/default-access-permission.enum';
import noteConfiguration, { NoteConfig } from '../config/note.config';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  MaximumDocumentLengthExceededError,
  NotInDBError,
} from '../errors/errors';
import { NoteEvent } from '../events';
import { Group } from '../groups/group.entity';
import { GroupsService } from '../groups/groups.service';
import { HistoryEntry } from '../history/history-entry.entity';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { RealtimeNoteStore } from '../realtime/realtime-note/realtime-note-store';
import { RealtimeNoteService } from '../realtime/realtime-note/realtime-note.service';
import { Revision } from '../revisions/revision.entity';
import { RevisionsService } from '../revisions/revisions.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Alias } from './alias.entity';
import { AliasService } from './alias.service';
import { NoteMetadataDto } from './note-metadata.dto';
import { NotePermissionsDto } from './note-permissions.dto';
import { NoteDto } from './note.dto';
import { Note } from './note.entity';
import { Tag } from './tag.entity';
import { getPrimaryAlias } from './utils';

@Injectable()
export class NotesService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(Note) private noteRepository: Repository<Note>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @InjectRepository(Alias) private aliasRepository: Repository<Alias>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(GroupsService) private groupsService: GroupsService,
    private revisionsService: RevisionsService,
    @Inject(noteConfiguration.KEY)
    private noteConfig: NoteConfig,
    @Inject(forwardRef(() => AliasService)) private aliasService: AliasService,
    private realtimeNoteService: RealtimeNoteService,
    private realtimeNoteStore: RealtimeNoteStore,
    private eventEmitter: EventEmitter2,
  ) {
    this.logger.setContext(NotesService.name);
  }

  /**
   * @async
   * Get all notes owned by a user.
   * @param {User} user - the user who owns the notes
   * @return {Note[]} arary of notes owned by the user
   */
  async getUserNotes(user: User): Promise<Note[]> {
    const notes = await this.noteRepository
      .createQueryBuilder('note')
      .where('note.owner = :user', { user: user.id })
      .getMany();
    if (notes === null) {
      return [];
    }
    return notes;
  }

  /**
   * @async
   * Create a new note.
   * @param {string} noteContent - the content the new note should have
   * @param {string=} alias - an optional alias the note should have
   * @param {User=} owner - the owner of the note
   * @return {Note} the newly created note
   * @throws {AlreadyInDBError} a note with the requested id or alias already exists
   * @throws {ForbiddenIdError} the requested id or alias is forbidden
   * @throws {MaximumDocumentLengthExceededError} the noteContent is longer than the maxDocumentLength
   */
  async createNote(
    noteContent: string,
    owner: User | null,
    alias?: string,
  ): Promise<Note> {
    if (alias) {
      this.checkNoteIdOrAlias(alias);
    }
    const newNote = Note.create(owner, alias);
    if (noteContent.length > this.noteConfig.maxDocumentLength) {
      throw new MaximumDocumentLengthExceededError();
    }
    //TODO: Calculate patch
    newNote.revisions = Promise.resolve([
      Revision.create(noteContent, noteContent, newNote as Note) as Revision,
    ]);
    if (owner) {
      newNote.historyEntries = Promise.resolve([
        HistoryEntry.create(owner, newNote as Note) as HistoryEntry,
      ]);
    }

    const everyonePermission = this.createGroupPermission(
      newNote as Note,
      await this.groupsService.getEveryoneGroup(),
      owner === null
        ? DefaultAccessPermission.WRITE
        : this.noteConfig.permissions.default.everyone,
    );

    const loggedInPermission = this.createGroupPermission(
      newNote as Note,
      await this.groupsService.getLoggedInGroup(),
      this.noteConfig.permissions.default.loggedIn,
    );

    newNote.groupPermissions = Promise.resolve([
      ...Optional.ofNullable(everyonePermission).wrapInArray(),
      ...Optional.ofNullable(loggedInPermission).wrapInArray(),
    ]);

    try {
      return await this.noteRepository.save(newNote);
    } catch (e) {
      if (alias) {
        this.logger.debug(
          `A note with the alias '${alias}' already exists.`,
          'createNote',
        );
        throw new AlreadyInDBError(
          `A note with the alias '${alias}' already exists.`,
        );
      } else {
        throw e;
      }
    }
  }

  private createGroupPermission(
    note: Note,
    group: Group,
    permission: DefaultAccessPermission,
  ): NoteGroupPermission | null {
    return permission === DefaultAccessPermission.NONE
      ? null
      : NoteGroupPermission.create(
          group,
          note,
          permission === DefaultAccessPermission.WRITE,
        );
  }

  /**
   * @async
   * Get the current content of the note.
   * @param {Note} note - the note to use
   * @return {string} the content of the note
   */
  async getNoteContent(note: Note): Promise<string> {
    return (
      this.realtimeNoteStore.find(note.id)?.getYDoc().getCurrentContent() ??
      (await this.revisionsService.getLatestRevision(note)).content
    );
  }

  /**
   * @async
   * Get a note by either their id or alias.
   * @param {string} noteIdOrAlias - the notes id or alias
   * @return {Note} the note
   * @throws {NotInDBError} there is no note with this id or alias
   * @throws {ForbiddenIdError} the requested id or alias is forbidden
   */
  async getNoteByIdOrAlias(noteIdOrAlias: string): Promise<Note> {
    this.logger.debug(
      `Trying to find note '${noteIdOrAlias}'`,
      'getNoteByIdOrAlias',
    );

    this.checkNoteIdOrAlias(noteIdOrAlias);

    /**
     * This query gets the note's aliases, owner, groupPermissions (and the groups), userPermissions (and the users) and tags and
     * then only gets the note, that either has a publicId :noteIdOrAlias or has any alias with this name.
     **/
    const note = await this.noteRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.aliases', 'alias')
      .leftJoinAndSelect('note.owner', 'owner')
      .leftJoinAndSelect('note.groupPermissions', 'group_permission')
      .leftJoinAndSelect('group_permission.group', 'group')
      .leftJoinAndSelect('note.userPermissions', 'user_permission')
      .leftJoinAndSelect('user_permission.user', 'user')
      .leftJoinAndSelect('note.tags', 'tag')
      .where('note.publicId = :noteIdOrAlias')
      .orWhere((queryBuilder) => {
        const subQuery = queryBuilder
          .subQuery()
          .select('alias.noteId')
          .from(Alias, 'alias')
          .where('alias.name = :noteIdOrAlias')
          .getQuery();
        return 'note.id IN ' + subQuery;
      })
      .setParameter('noteIdOrAlias', noteIdOrAlias)
      .getOne();

    if (note === null) {
      this.logger.debug(
        `Could not find note '${noteIdOrAlias}'`,
        'getNoteByIdOrAlias',
      );
      throw new NotInDBError(
        `Note with id/alias '${noteIdOrAlias}' not found.`,
      );
    }
    this.logger.debug(`Found note '${noteIdOrAlias}'`, 'getNoteByIdOrAlias');
    return note;
  }

  /**
   * @async
   * Get all users that ever appeared as an author for the given note
   * @param note The note to search authors for
   */
  async getAuthorUsers(note: Note): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.authors', 'author')
      .innerJoin('author.edits', 'edit')
      .innerJoin('edit.revisions', 'revision')
      .innerJoin('revision.note', 'note')
      .where('note.id = :id', { id: note.id })
      .getMany();
  }

  /**
   * Check if the provided note id or alias is not forbidden
   * @param noteIdOrAlias - the alias or id in question
   * @throws {ForbiddenIdError} the requested id or alias is forbidden
   */
  checkNoteIdOrAlias(noteIdOrAlias: string): void {
    if (this.noteConfig.forbiddenNoteIds.includes(noteIdOrAlias)) {
      this.logger.debug(
        `A note with the alias '${noteIdOrAlias}' is forbidden by the administrator.`,
        'checkNoteIdOrAlias',
      );
      throw new ForbiddenIdError(
        `A note with the alias '${noteIdOrAlias}' is forbidden by the administrator.`,
      );
    }
  }

  /**
   * @async
   * Delete a note
   * @param {Note} note - the note to delete
   * @return {Note} the note, that was deleted
   * @throws {NotInDBError} there is no note with this id or alias
   */
  async deleteNote(note: Note): Promise<Note> {
    this.eventEmitter.emit(NoteEvent.DELETION, note.id);
    return await this.noteRepository.remove(note);
  }

  /**
   * @async
   * Update a notes content.
   * @param {Note} note - the note
   * @param {string} noteContent - the new content
   * @return {Note} the note with a new revision and new content
   * @throws {NotInDBError} there is no note with this id or alias
   */
  async updateNote(note: Note, noteContent: string): Promise<Note> {
    const revisions = await note.revisions;
    //TODO: Calculate patch
    revisions.push(Revision.create(noteContent, noteContent, note) as Revision);
    note.revisions = Promise.resolve(revisions);
    return await this.noteRepository.save(note);
  }

  /**
   * @async
   * Calculate the updateUser (for the NoteDto) for a Note.
   * @param {Note} note - the note to use
   * @return {User} user to be used as updateUser in the NoteDto
   */
  async calculateUpdateUser(note: Note): Promise<User | null> {
    const lastRevision = await this.revisionsService.getLatestRevision(note);
    const edits = await lastRevision.edits;
    if (edits.length > 0) {
      // Sort the last Revisions Edits by their updatedAt Date to get the latest one
      // the user of that Edit is the updateUser
      return await (
        await edits.sort(
          (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
        )[0].author
      ).user;
    }
    // If there are no Edits, the owner is the updateUser
    return await note.owner;
  }

  /**
   * Map the tags of a note to a string array of the tags names.
   * @param {Note} note - the note to use
   * @return {string[]} string array of tags names
   */
  async toTagList(note: Note): Promise<string[]> {
    return (await note.tags).map((tag) => tag.name);
  }

  /**
   * Build NotePermissionsDto from a note.
   * @param {Note} note - the note to use
   * @return {NotePermissionsDto} the built NotePermissionDto
   */
  async toNotePermissionsDto(note: Note): Promise<NotePermissionsDto> {
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
    const updateUser = await this.calculateUpdateUser(note);
    return {
      id: note.publicId,
      aliases: await Promise.all(
        (
          await note.aliases
        ).map((alias) => this.aliasService.toAliasDto(alias, note)),
      ),
      primaryAddress: (await getPrimaryAlias(note)) ?? note.publicId,
      title: note.title ?? '',
      createdAt: note.createdAt,
      description: note.description ?? '',
      editedBy: (await this.getAuthorUsers(note)).map((user) => user.username),
      permissions: await this.toNotePermissionsDto(note),
      tags: await this.toTagList(note),
      version: note.version,
      updatedAt: (await this.revisionsService.getLatestRevision(note))
        .createdAt,
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
