/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotInDBError } from '../errors/errors';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { Revision } from '../revisions/revision.entity';
import { RevisionsService } from '../revisions/revisions.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { NoteMetadataDto } from './note-metadata.dto';
import {
  NotePermissionsDto,
  NotePermissionsUpdateDto,
} from './note-permissions.dto';
import { NoteDto } from './note.dto';
import { Note } from './note.entity';
import { Tag } from './tag.entity';
import { HistoryEntry } from '../history/history-entry.entity';

@Injectable()
export class NotesService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(Note) private noteRepository: Repository<Note>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(forwardRef(() => RevisionsService))
    private revisionsService: RevisionsService,
  ) {
    this.logger.setContext(NotesService.name);
  }

  /**
   * @async
   * Get all notes owned by a user.
   * @param {User} user - the user who owns the notes
   * @return {Note[]} arary of notes owned by the user
   */
  getUserNotes(user: User): Note[] {
    this.logger.warn('Using hardcoded data!');
    return [
      {
        id: 'foobar-barfoo',
        alias: null,
        shortid: 'abc',
        owner: user,
        description: 'Very descriptive text.',
        userPermissions: [],
        groupPermissions: [],
        historyEntries: [],
        tags: [],
        revisions: Promise.resolve([]),
        authorColors: [],
        title: 'Title!',
        viewcount: 42,
      },
    ];
  }

  /**
   * @async
   * Create a new note.
   * @param {string} noteContent - the content the new note should have
   * @param {string=} alias - a optional alias the note should have
   * @param {User=} owner - the owner of the note
   * @return {Note} the newly created note
   */
  async createNote(
    noteContent: string,
    alias?: NoteMetadataDto['alias'],
    owner?: User,
  ): Promise<Note> {
    const newNote = Note.create();
    newNote.revisions = Promise.resolve([
      //TODO: Calculate patch
      Revision.create(noteContent, noteContent),
    ]);
    if (alias) {
      newNote.alias = alias;
    }
    if (owner) {
      newNote.historyEntries = [HistoryEntry.create(owner)];
      newNote.owner = owner;
    }
    try {
      return await this.noteRepository.save(newNote);
    } catch {
      this.logger.debug(
        `A note with the alias '${alias}' already exists.`,
        'createNote',
      );
      throw new AlreadyInDBError(
        `A note with the alias '${alias}' already exists.`,
      );
    }
  }

  /**
   * @async
   * Get the current content of the note.
   * @param {Note} note - the note to use
   * @return {string} the content of the note
   */
  async getNoteContentByNote(note: Note): Promise<string> {
    return (await this.getLatestRevision(note)).content;
  }

  /**
   * @async
   * Get the first revision of the note.
   * @param {Note} note - the note to use
   * @return {Revision} the first revision of the note
   */
  async getLatestRevision(note: Note): Promise<Revision> {
    return this.revisionsService.getLatestRevision(note.id);
  }

  /**
   * @async
   * Get the last revision of the note.
   * @param {Note} note - the note to use
   * @return {Revision} the last revision of the note
   */
  async getFirstRevision(note: Note): Promise<Revision> {
    return this.revisionsService.getFirstRevision(note.id);
  }

  /**
   * @async
   * Get a note by either their id or alias.
   * @param {string} noteIdOrAlias - the notes id or alias
   * @return {Note} the note
   * @throws {NotInDBError} there is no note with this id or alias
   */
  async getNoteByIdOrAlias(noteIdOrAlias: string): Promise<Note> {
    this.logger.debug(
      `Trying to find note '${noteIdOrAlias}'`,
      'getNoteByIdOrAlias',
    );
    const note = await this.noteRepository.findOne({
      where: [
        {
          id: noteIdOrAlias,
        },
        {
          alias: noteIdOrAlias,
        },
      ],
      relations: [
        'authorColors',
        'owner',
        'groupPermissions',
        'userPermissions',
      ],
    });
    if (note === undefined) {
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
   * Delete a note by either their id or alias.
   * @param {string} noteIdOrAlias - the notes id or alias
   * @return {Note} the note, that was deleted
   * @throws {NotInDBError} there is no note with this id or alias
   */
  async deleteNoteByIdOrAlias(noteIdOrAlias: string): Promise<Note> {
    const note = await this.getNoteByIdOrAlias(noteIdOrAlias);
    return await this.noteRepository.remove(note);
  }

  /**
   * @async
   * Update a notes content. The note is specified by either their id or alias.
   * @param {string} noteIdOrAlias - the notes id or alias
   * @param {string} noteContent - the new content
   * @return {Note} the note with a new revision and new content
   * @throws {NotInDBError} there is no note with this id or alias
   */
  async updateNoteByIdOrAlias(
    noteIdOrAlias: string,
    noteContent: string,
  ): Promise<Note> {
    const note = await this.getNoteByIdOrAlias(noteIdOrAlias);
    const revisions = await note.revisions;
    //TODO: Calculate patch
    revisions.push(Revision.create(noteContent, noteContent));
    note.revisions = Promise.resolve(revisions);
    return this.noteRepository.save(note);
  }

  /**
   * @async
   * Update a notes permissions. The note is specified by either their id or alias.
   * @param {string} noteIdOrAlias - the notes id or alias
   * @param {NotePermissionsUpdateDto} newPermissions - the permissions the not should be set to
   * @return {Note} the note with the new permissions
   * @throws {NotInDBError} there is no note with this id or alias
   * @throws {PermissionsUpdateInconsistent} the new permissions specify a user or group twice.
   */
  async updateNotePermissions(
    noteIdOrAlias: string,
    newPermissions: NotePermissionsUpdateDto,
  ): Note {
    this.logger.warn('Using hardcoded data!', 'updateNotePermissions');
    return {
      id: 'foobar-barfoo',
      alias: null,
      shortid: 'abc',
      owner: {
        authTokens: [],
        createdAt: new Date(),
        displayName: 'hardcoded',
        id: '1',
        identities: [],
        ownedNotes: [],
        historyEntries: [],
        updatedAt: new Date(),
        userName: 'Testy',
        groups: [],
      },
      description: 'Very descriptive text.',
      userPermissions: [],
      groupPermissions: [],
      historyEntries: [],
      tags: [],
      revisions: Promise.resolve([]),
      authorColors: [],
      title: 'Title!',
      viewcount: 42,
    };
  }

  async getNoteContent(noteIdOrAlias: string): Promise<string> {
    const note = await this.getNoteByIdOrAlias(noteIdOrAlias);
    return this.getCurrentContent(note);
  }

  /**
   * Map the tags of a note to a string array of the tags names.
   * @param {Note} note - the note to use
   * @return {string[]} string array of tags names
   */
  toTagList(note: Note): string[] {
    return note.tags.map((tag) => tag.name);
  }

  /**
   * @async
   * Build NotePermissionsDto from a note.
   * @param {Note} note - the note to use
   * @return {NotePermissionsDto} the built NotePermissionDto
   */
  async toNotePermissionsDto(note: Note): Promise<NotePermissionsDto> {
    return {
      owner: this.usersService.toUserDto(note.owner),
      sharedToUsers: note.userPermissions.map((noteUserPermission) => ({
        user: this.usersService.toUserDto(noteUserPermission.user),
        canEdit: noteUserPermission.canEdit,
      })),
      sharedToGroups: note.groupPermissions.map((noteGroupPermission) => ({
        group: noteGroupPermission.group,
        canEdit: noteGroupPermission.canEdit,
      })),
    };
  }

  /**
   * @async
   * Build NoteMetadataDto from a note.
   * @param {Note} note - the note to use
   * @return {NoteMetadataDto} the built NoteMetadataDto
   */
  async toNoteMetadataDto(note: Note): Promise<NoteMetadataDto> {
    return {
      // TODO: Convert DB UUID to base64
      id: note.id,
      alias: note.alias,
      title: note.title,
      createTime: (await this.getFirstRevision(note)).createdAt,
      description: note.description,
      editedBy: note.authorColors.map(
        (authorColor) => authorColor.user.userName,
      ),
      // TODO: Extract into method
      permissions: await this.toNotePermissionsDto(note),
      tags: this.toTagList(note),
      updateTime: (await this.getLatestRevision(note)).createdAt,
      // TODO: Get actual updateUser
      updateUser: {
        displayName: 'Hardcoded User',
        userName: 'hardcoded',
        email: 'foo@example.com',
        photo: '',
      },
      viewCount: 42,
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
      content: await this.getCurrentContent(note),
      metadata: await this.toNoteMetadataDto(note),
      editedByAtPosition: [],
    };
  }
}
