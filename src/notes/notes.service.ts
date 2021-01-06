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
import { NoteMetadataDto, NoteMetadataUpdateDto } from './note-metadata.dto';
import {
  NotePermissionsDto,
  NotePermissionsUpdateDto,
} from './note-permissions.dto';
import { NoteDto } from './note.dto';
import { Note } from './note.entity';
import { Tag } from './tag.entity';

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

  getUserNotes(username: string): NoteMetadataDto[] {
    this.logger.warn('Using hardcoded data!');
    return [
      {
        alias: null,
        createTime: new Date(),
        description: 'Very descriptive text.',
        editedBy: [],
        id: 'foobar-barfoo',
        permissions: {
          owner: {
            displayName: 'foo',
            userName: 'fooUser',
            email: 'foo@example.com',
            photo: '',
          },
          sharedToUsers: [],
          sharedToGroups: [],
        },
        tags: [],
        title: 'Title!',
        updateTime: new Date(),
        updateUser: {
          displayName: 'foo',
          userName: 'fooUser',
          email: 'foo@example.com',
          photo: '',
        },
        viewCount: 42,
      },
    ];
  }

  async createNoteDto(
    noteContent: string,
    alias?: NoteMetadataDto['alias'],
    owner?: User,
  ): Promise<NoteDto> {
    const note = await this.createNote(noteContent, alias, owner);
    return this.toNoteDto(note);
  }

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
      newNote.owner = owner;
    }
    return this.noteRepository.save(newNote);
  }

  async getCurrentContent(note: Note) {
    return (await this.getLastRevision(note)).content;
  }

  async getLastRevision(note: Note): Promise<Revision> {
    return this.revisionsService.getLatestRevision(note.id);
  }

  async getMetadata(note: Note): Promise<NoteMetadataDto> {
    return {
      // TODO: Convert DB UUID to base64
      id: note.id,
      alias: note.alias,
      title: note.title,
      // TODO: Get actual createTime
      createTime: new Date(),
      description: note.description,
      editedBy: note.authorColors.map(
        (authorColor) => authorColor.user.userName,
      ),
      // TODO: Extract into method
      permissions: {
        owner: this.usersService.toUserDto(note.owner),
        sharedToUsers: note.userPermissions.map((noteUserPermission) => ({
          user: this.usersService.toUserDto(noteUserPermission.user),
          canEdit: noteUserPermission.canEdit,
        })),
        sharedToGroups: note.groupPermissions.map((noteGroupPermission) => ({
          group: noteGroupPermission.group,
          canEdit: noteGroupPermission.canEdit,
        })),
      },
      tags: note.tags.map((tag) => tag.name),
      updateTime: (await this.getLastRevision(note)).createdAt,
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

  async getNoteDtoByIdOrAlias(noteIdOrAlias: string): Promise<NoteDto> {
    const note = await this.getNoteByIdOrAlias(noteIdOrAlias);
    return this.toNoteDto(note);
  }

  async deleteNoteByIdOrAlias(noteIdOrAlias: string) {
    const note = await this.getNoteByIdOrAlias(noteIdOrAlias);
    return await this.noteRepository.remove(note);
  }

  async updateNoteByIdOrAlias(noteIdOrAlias: string, noteContent: string) {
    const note = await this.getNoteByIdOrAlias(noteIdOrAlias);
    const revisions = await note.revisions;
    //TODO: Calculate patch
    revisions.push(Revision.create(noteContent, noteContent));
    note.revisions = Promise.resolve(revisions);
    await this.noteRepository.save(note);
  }

  async getNoteMetadata(noteIdOrAlias: string): Promise<NoteMetadataDto> {
    const note = await this.getNoteByIdOrAlias(noteIdOrAlias);
    return this.getMetadata(note);
  }

  updateNotePermissions(
    noteIdOrAlias: string,
    newPermissions: NotePermissionsUpdateDto,
  ): NotePermissionsDto {
    this.logger.warn('Using hardcoded data!');
    return {
      owner: {
        displayName: 'foo',
        userName: 'fooUser',
        email: 'foo@example.com',
        photo: '',
      },
      sharedToUsers: [],
      sharedToGroups: [],
    };
  }

  async getNoteContent(noteIdOrAlias: string): Promise<string> {
    const note = await this.getNoteByIdOrAlias(noteIdOrAlias);
    return this.getCurrentContent(note);
  }

  async toNoteDto(note: Note): Promise<NoteDto> {
    return {
      content: await this.getCurrentContent(note),
      metadata: await this.getMetadata(note),
      editedByAtPosition: [],
    };
  }
}
