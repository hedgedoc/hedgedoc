/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  NotInDBError,
  PermissionsUpdateInconsistentError,
} from '../errors/errors';
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
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { GroupsService } from '../groups/groups.service';
import { checkArrayForDuplicates } from '../utils/arrayDuplicatCheck';
import appConfiguration, { AppConfig } from '../config/app.config';
import base32Encode from 'base32-encode';
import { randomBytes } from 'crypto';

@Injectable()
export class NotesService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(Note) private noteRepository: Repository<Note>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(GroupsService) private groupsService: GroupsService,
    @Inject(forwardRef(() => RevisionsService))
    private revisionsService: RevisionsService,
    @Inject(appConfiguration.KEY)
    private appConfig: AppConfig,
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
    const notes = await this.noteRepository.find({
      where: { owner: user },
      relations: ['owner', 'userPermissions', 'groupPermissions', 'tags'],
    });
    if (notes === undefined) {
      return [];
    }
    return notes;
  }

  /**
   * @async
   * Create a new note.
   * @param {string} noteContent - the content the new note should have
   * @param {string=} alias - a optional alias the note should have
   * @param {User=} owner - the owner of the note
   * @return {Note} the newly created note
   * @throws {AlreadyInDBError} a note with the requested id or alias already exists
   * @throws {ForbiddenIdError} the requested id or alias is forbidden
   */
  async createNote(
    noteContent: string,
    alias?: NoteMetadataDto['alias'],
    owner?: User,
  ): Promise<Note> {
    const newNote = Note.create();
    //TODO: Calculate patch
    newNote.revisions = Promise.resolve([
      Revision.create(noteContent, noteContent),
    ]);
    if (alias) {
      newNote.alias = alias;
      this.checkNoteIdOrAlias(alias);
    }
    if (owner) {
      newNote.historyEntries = [HistoryEntry.create(owner)];
      newNote.owner = owner;
    }
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

  /**
   * @async
   * Get the current content of the note.
   * @param {Note} note - the note to use
   * @return {string} the content of the note
   */
  async getNoteContent(note: Note): Promise<string> {
    return (await this.getLatestRevision(note)).content;
  }

  /**
   * @async
   * Get the first revision of the note.
   * @param {Note} note - the note to use
   * @return {Revision} the first revision of the note
   */
  async getLatestRevision(note: Note): Promise<Revision> {
    return await this.revisionsService.getLatestRevision(note.id);
  }

  /**
   * @async
   * Get the last revision of the note.
   * @param {Note} note - the note to use
   * @return {Revision} the last revision of the note
   */
  async getFirstRevision(note: Note): Promise<Revision> {
    return await this.revisionsService.getFirstRevision(note.id);
  }

  /**
   * @async
   * Get a note by either their id or alias.
   * @param {string} noteIdOrAlias - the notes id or alias
   * @return {Note} the note
   * @throws {ForbiddenIdError} the requested id or alias is forbidden
   * @throws {NotInDBError} there is no note with this id or alias
   */
  async getNoteByIdOrAlias(noteIdOrAlias: string): Promise<Note> {
    this.logger.debug(
      `Trying to find note '${noteIdOrAlias}'`,
      'getNoteByIdOrAlias',
    );
    this.checkNoteIdOrAlias(noteIdOrAlias);
    const note = await this.noteRepository.findOne({
      where: [
        {
          publicId: noteIdOrAlias,
        },
        {
          alias: noteIdOrAlias,
        },
      ],
      relations: [
        'owner',
        'groupPermissions',
        'groupPermissions.group',
        'userPermissions',
        'userPermissions.user',
        'tags',
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
   * Check if the provided note id or alias is not forbidden
   * @param noteIdOrAlias - the alias or id in question
   * @throws {ForbiddenIdError} the requested id or alias is forbidden
   */
  checkNoteIdOrAlias(noteIdOrAlias: string): void {
    if (this.appConfig.forbiddenNoteIds.includes(noteIdOrAlias)) {
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
    revisions.push(Revision.create(noteContent, noteContent));
    note.revisions = Promise.resolve(revisions);
    note.userPermissions = [];
    note.groupPermissions = [];
    return await this.noteRepository.save(note);
  }

  /**
   * @async
   * Update a notes permissions.
   * @param {Note} note - the note
   * @param {NotePermissionsUpdateDto} newPermissions - the permissions the not should be set to
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
      (groupPermission) => groupPermission.groupname,
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

    note.userPermissions = [];
    note.groupPermissions = [];

    // Create new userPermissions
    for (const newUserPermission of newPermissions.sharedToUsers) {
      const user = await this.usersService.getUserByUsername(
        newUserPermission.username,
      );
      const createdPermission = NoteUserPermission.create(
        user,
        newUserPermission.canEdit,
      );
      createdPermission.note = note;
      note.userPermissions.push(createdPermission);
    }

    // Create groupPermissions
    for (const newGroupPermission of newPermissions.sharedToGroups) {
      const group = await this.groupsService.getGroupByName(
        newGroupPermission.groupname,
      );
      const createdPermission = NoteGroupPermission.create(
        group,
        newGroupPermission.canEdit,
      );
      createdPermission.note = note;
      note.groupPermissions.push(createdPermission);
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
    const lastRevision = await this.getLatestRevision(note);
    if (lastRevision && lastRevision.authorships) {
      // Sort the last Revisions Authorships by their updatedAt Date to get the latest one
      // the user of that Authorship is the updateUser
      return lastRevision.authorships.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      )[0].user;
    }
    // If there are no Authorships, the owner is the updateUser
    return note.owner;
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
   * Build NotePermissionsDto from a note.
   * @param {Note} note - the note to use
   * @return {NotePermissionsDto} the built NotePermissionDto
   */
  toNotePermissionsDto(note: Note): NotePermissionsDto {
    return {
      owner: note.owner ? this.usersService.toUserDto(note.owner) : null,
      sharedToUsers: note.userPermissions.map((noteUserPermission) => ({
        user: this.usersService.toUserDto(noteUserPermission.user),
        canEdit: noteUserPermission.canEdit,
      })),
      sharedToGroups: note.groupPermissions.map((noteGroupPermission) => ({
        group: this.groupsService.toGroupDto(noteGroupPermission.group),
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
    const updateUser = await this.calculateUpdateUser(note);
    return {
      id: note.publicId,
      alias: note.alias ?? null,
      title: note.title ?? '',
      createTime: (await this.getFirstRevision(note)).createdAt,
      description: note.description ?? '',
      editedBy: [], // TODO temporary placeholder,
      permissions: this.toNotePermissionsDto(note),
      tags: this.toTagList(note),
      updateTime: (await this.getLatestRevision(note)).createdAt,
      updateUser: updateUser ? this.usersService.toUserDto(updateUser) : null,
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
