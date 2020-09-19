import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Revision } from '../revisions/revision.entity';
import { User } from '../users/user.entity';
import { NoteMetadataDto } from './note-metadata.dto';
import {
  NotePermissionsDto,
  NotePermissionsUpdateDto,
} from './note-permissions.dto';
import { NoteDto } from './note.dto';
import { Note } from './note.entity';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    @InjectRepository(Note) private noteRepository: Repository<Note>,
  ) {}

  getUserNotes(username: string): NoteMetadataDto[] {
    this.logger.warn('Using hardcoded data!');
    return [
      {
        alias: null,
        createTime: new Date(),
        description: 'Very descriptive text.',
        editedBy: [],
        id: 'foobar-barfoo',
        permission: {
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

  async createNote(
    noteContent: string,
    alias?: NoteMetadataDto['alias'],
    owner?: User,
  ): Promise<NoteDto> {
    this.logger.warn('Using hardcoded data!');
    const newNote = Note.create();
    newNote.revisions = [Revision.create(noteContent, noteContent)];
    if (alias) {
      newNote.alias = alias;
    }
    if (owner) {
      newNote.owner = owner;
    }
    const savedNote = await this.noteRepository.save(newNote);
    return {
      content: this.getCurrentContent(savedNote),
      metadata: this.getMetadata(savedNote),
      editedByAtPosition: [],
    };
  }

  getCurrentContent(note: Note) {
    return note.revisions[note.revisions.length - 1].content;
  }

  getMetadata(note: Note) {
    return {
      alias: note.alias,
      createTime: new Date(),
      description: 'Very descriptive text.',
      editedBy: [],
      id: note.id,
      permission: {
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
    };
  }

  getNoteByIdOrAlias(noteIdOrAlias: string) {
    this.logger.warn('Using hardcoded data!');
    return {
      content: 'noteContent',
      metadata: {
        alias: null,
        createTime: new Date(),
        description: 'Very descriptive text.',
        editedBy: [],
        id: noteIdOrAlias,
        permission: {
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
      editedByAtPosition: [],
    };
  }

  deleteNoteByIdOrAlias(noteIdOrAlias: string) {
    this.logger.warn('Using hardcoded data!');
    return;
  }

  updateNoteByIdOrAlias(noteIdOrAlias: string, noteContent: string) {
    this.logger.warn('Using hardcoded data!');
    return {
      content: noteContent,
      metdata: {
        alias: null,
        createTime: new Date(),
        description: 'Very descriptive text.',
        editedBy: [],
        id: noteIdOrAlias,
        permission: {
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
      editedByAtPosition: [],
    };
  }

  getNoteMetadata(noteIdOrAlias: string): NoteMetadataDto {
    this.logger.warn('Using hardcoded data!');
    return {
      alias: null,
      createTime: new Date(),
      description: 'Very descriptive text.',
      editedBy: [],
      id: noteIdOrAlias,
      permission: {
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
    };
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

  getNoteContent(noteIdOrAlias: string) {
    this.logger.warn('Using hardcoded data!');
    return '# Markdown';
  }
}
