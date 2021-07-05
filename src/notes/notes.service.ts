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
import { Alias } from './alias.entity';
import { HistoryEntry } from '../history/history-entry.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { GroupsService } from '../groups/groups.service';
import { checkArrayForDuplicates } from '../utils/arrayDuplicatCheck';
import appConfiguration, { AppConfig } from '../config/app.config';

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
      relations: [
        'owner',
        'userPermissions',
        'groupPermissions',
        'tags',
        'aliases',
      ],
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
    alias?: string,
    owner?: User,
  ): Promise<Note> {
    const newNote = Note.create();
    //TODO: Calculate patch
    newNote.revisions = Promise.resolve([
      Revision.create(noteContent, noteContent),
    ]);
    if (alias) {
      this.checkNoteIdOrAlias(alias);
      newNote.aliases = [Alias.create(alias, true)];
    } else {
      newNote.aliases = [];
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
    if (lastRevision && lastRevision.edits) {
      // Sort the last Revisions Edits by their updatedAt Date to get the latest one
      // the user of that Edit is the updateUser
      return lastRevision.edits.sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      )[0].author.user;
    }
    // If there are no Edits, the owner is the updateUser
    return note.owner;
  }

  /**
   * @async
   * Add the specified alias to the note.
   * @param {Note} note - the note to add the alias to
   * @param {string} alias - the alias to add to the note
   * @throws {AlreadyInDBError} the alias is already in use.
   */
  async addAlias(note: Note, alias: string): Promise<Note> {
    this.checkNoteIdOrAlias(alias);

    const foundAlias = await this.aliasRepository.findOne({
      where: { name: alias },
    });
    if (foundAlias !== undefined) {
      this.logger.debug(`The alias '${alias}' is already used.`, 'addAlias');
      throw new AlreadyInDBError(`The alias '${alias}' is already used.`);
    }

    note.aliases.push(Alias.create(alias));

    return await this.noteRepository.save(note);
  }

  /**
   * @async
   * Set the specified alias as the primary alias of the note.
   * @param {Note} note - the note to change the primary alias
   * @param {string} alias - the alias to be the new primary alias of the note
   * @throws {NotInDBError} the alias is not part of this note.
   */
  async makeAliasPrimary(note: Note, alias: string): Promise<Note> {
    let newPrimaryFound = false;
    let oldPrimaryId = '';
    let newPrimaryId = '';

    for (const anAlias of note.aliases) {
      // found old primary
      if (anAlias.primary) {
        oldPrimaryId = anAlias.id;
      }

      // found new primary
      if (anAlias.name === alias) {
        newPrimaryFound = true;
        newPrimaryId = anAlias.id;
      }
    }

    if (!newPrimaryFound) {
      // the provided alias is not already an alias of this note
      this.logger.debug(
        `The alias '${alias}' is not used by this note.`,
        'makeAliasPrimary',
      );
      throw new NotInDBError(`The alias '${alias}' is not used by this note.`);
    }

    const oldPrimary = await this.aliasRepository.findOne(oldPrimaryId);
    const newPrimary = await this.aliasRepository.findOne(newPrimaryId);

    if (!oldPrimary || !newPrimary) {
      throw new Error('This should not happen!');
    }

    oldPrimary.primary = false;
    newPrimary.primary = true;

    await this.aliasRepository.save(oldPrimary);
    await this.aliasRepository.save(newPrimary);

    return await this.getNoteByIdOrAlias(note.publicId);
  }

  /**
   * @async
   * Remove the specified alias from the note.
   * @param {Note} note - the note to remove the alias from
   * @param {string} alias - the alias to remove from the note
   * @throws {NotInDBError} the alias is not part of this note.
   */
  async removeAlias(note: Note, alias: string): Promise<Note> {
    const filteredAliases = note.aliases.filter(
      (anAlias) =>
        anAlias.name !== alias || (anAlias.name === alias && anAlias.primary),
    );
    if (note.aliases.length === filteredAliases.length) {
      this.logger.debug(
        `The alias '${alias}' is not used by this note or is the primary alias, that can't be removed.`,
        'removeAlias',
      );
      throw new NotInDBError(
        `The alias '${alias}' is not used by this note or is the primary alias, that can't be removed.`,
      );
    }
    note.aliases = filteredAliases;
    return await this.noteRepository.save(note);
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
      aliases: note.aliases.map((alias) => alias.name),
      primaryAlias:
        note.aliases.length !== 0
          ? note.aliases.filter((alias) => alias.primary)[0].name
          : null,
      title: note.title ?? '',
      createTime: (await this.getFirstRevision(note)).createdAt,
      description: note.description ?? '',
      editedBy: (await this.getAuthorUsers(note)).map((user) => user.userName),
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
