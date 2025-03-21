/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  NoteDto,
  NoteMetadataDto,
  NotePermissionsDto,
} from '@hedgedoc/commons';
import { Optional } from '@mrdrogdrog/optional';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DefaultAccessLevel } from '../config/default-access-level.enum';
import noteConfiguration, { NoteConfig } from '../config/note.config';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  MaximumDocumentLengthExceededError,
  NotInDBError,
} from '../errors/errors';
import { NoteEvent, NoteEventMap } from '../events';
import { Group } from '../groups/group.entity';
import { GroupsService } from '../groups/groups.service';
import { HistoryEntry } from '../history/history-entry.entity';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { RealtimeNoteStore } from '../realtime/realtime-note/realtime-note-store';
import { RealtimeNoteService } from '../realtime/realtime-note/realtime-note.service';
import { RevisionsService } from '../revisions/revisions.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Alias } from './alias.entity';
import { AliasService } from './alias.service';
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
    private eventEmitter: EventEmitter2<NoteEventMap>,
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
    // Check if new note doesn't violate application constraints
    if (alias) {
      await this.ensureNoteIdOrAliasIsAvailable(alias);
    }
    if (noteContent.length > this.noteConfig.maxDocumentLength) {
      throw new MaximumDocumentLengthExceededError();
    }

    // We cast to a note early to keep the later code clean
    const newNote = Note.create(owner, alias) as Note;
    const newRevision = await this.revisionsService.createRevision(
      newNote,
      noteContent,
    );
    newNote.revisions = Promise.resolve(
      newRevision === undefined ? [] : [newRevision],
    );

    let everyoneAccessLevel;

    if (owner) {
      // When we know an owner, an initial history entry is created
      newNote.historyEntries = Promise.resolve([
        HistoryEntry.create(owner, newNote) as HistoryEntry,
      ]);
      // Use the default access level from the config
      everyoneAccessLevel = this.noteConfig.permissions.default.everyone;
    } else {
      // If there is no owner, this is an anonymous note
      // Anonymous notes are always writeable by everyone
      everyoneAccessLevel = DefaultAccessLevel.WRITE;
    }

    // Create permission object for the 'everyone' group
    const everyonePermission = this.createGroupPermission(
      newNote,
      await this.groupsService.getEveryoneGroup(),
      everyoneAccessLevel,
    );

    // Create permission object for logged-in users
    const loggedInPermission = this.createGroupPermission(
      newNote,
      await this.groupsService.getLoggedInGroup(),
      this.noteConfig.permissions.default.loggedIn,
    );

    // Merge into permissions array
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
    accessLevel: DefaultAccessLevel,
  ): NoteGroupPermission | null {
    if (accessLevel === DefaultAccessLevel.NONE) {
      return null;
    }
    return NoteGroupPermission.create(
      group,
      note,
      accessLevel === DefaultAccessLevel.WRITE,
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
      this.realtimeNoteStore
        .find(note.id)
        ?.getRealtimeDoc()
        .getCurrentContent() ??
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
    const isForbidden = this.noteIdOrAliasIsForbidden(noteIdOrAlias);
    if (isForbidden) {
      throw new ForbiddenIdError(
        `The note id or alias '${noteIdOrAlias}' is forbidden by the administrator.`,
      );
    }

    this.logger.debug(
      `Trying to find note '${noteIdOrAlias}'`,
      'getNoteByIdOrAlias',
    );

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
   * Check if the provided note id or alias is available for notes
   * @param noteIdOrAlias - the alias or id in question
   * @throws {ForbiddenIdError} the requested id or alias is not available
   */
  async ensureNoteIdOrAliasIsAvailable(noteIdOrAlias: string): Promise<void> {
    const isForbidden = this.noteIdOrAliasIsForbidden(noteIdOrAlias);
    if (isForbidden) {
      throw new ForbiddenIdError(
        `The note id or alias '${noteIdOrAlias}' is forbidden by the administrator.`,
      );
    }
    const isUsed = await this.noteIdOrAliasIsUsed(noteIdOrAlias);
    if (isUsed) {
      throw new AlreadyInDBError(
        `A note with the id or alias '${noteIdOrAlias}' already exists.`,
      );
    }
  }

  /**
   * Check if the provided note id or alias is forbidden
   * @param noteIdOrAlias - the alias or id in question
   * @return {boolean} true if the id or alias is forbidden, false otherwise
   */
  noteIdOrAliasIsForbidden(noteIdOrAlias: string): boolean {
    const forbidden = this.noteConfig.forbiddenNoteIds.includes(noteIdOrAlias);
    if (forbidden) {
      this.logger.debug(
        `A note with the alias '${noteIdOrAlias}' is forbidden by the administrator.`,
        'noteIdOrAliasIsForbidden',
      );
    }
    return forbidden;
  }

  /**
   * @async
   * Check if the provided note id or alias is already used
   * @param noteIdOrAlias - the alias or id in question
   * @return {boolean} true if the id or alias is already used, false otherwise
   */
  async noteIdOrAliasIsUsed(noteIdOrAlias: string): Promise<boolean> {
    const noteWithPublicIdExists = await this.noteRepository.existsBy({
      publicId: noteIdOrAlias,
    });
    const noteWithAliasExists = await this.aliasRepository.existsBy({
      name: noteIdOrAlias,
    });
    if (noteWithPublicIdExists || noteWithAliasExists) {
      this.logger.debug(
        `A note with the id or alias '${noteIdOrAlias}' already exists.`,
        'noteIdOrAliasIsUsed',
      );
      return true;
    }
    return false;
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
    const newRevision = await this.revisionsService.createRevision(
      note,
      noteContent,
    );
    if (newRevision !== undefined) {
      revisions.push(newRevision);
      note.revisions = Promise.resolve(revisions);
    }
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
      createdAt: note.createdAt.toISOString(),
      editedBy: (await this.getAuthorUsers(note)).map((user) => user.username),
      permissions: await this.toNotePermissionsDto(note),
      version: note.version,
      updatedAt: latestRevision.createdAt.toISOString(),
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
