import { Injectable, Logger } from '@nestjs/common';
import { NoteMetadataDto } from './note-metadata.dto';
import {
  NotePermissionsDto,
  NotePermissionsUpdateDto,
} from './note-permissions.dto';
import { NoteDto } from './note.dto';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

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

  createNote(noteContent: string, alias?: NoteMetadataDto['alias']): NoteDto {
    this.logger.warn('Using hardcoded data!');
    return {
      content: noteContent,
      metdata: {
        alias: alias,
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
      editedByAtPosition: [],
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
