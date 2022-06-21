/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { AuthToken } from '../auth/auth-token.entity';
import { Author } from '../authors/author.entity';
import appConfigMock from '../config/mock/app.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  NotInDBError,
} from '../errors/errors';
import { Group } from '../groups/group.entity';
import { GroupsModule } from '../groups/groups.module';
import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Edit } from '../revisions/edit.entity';
import { Revision } from '../revisions/revision.entity';
import { RevisionsModule } from '../revisions/revisions.module';
import { Session } from '../users/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { Alias } from './alias.entity';
import { AliasService } from './alias.service';
import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { Tag } from './tag.entity';

describe('NotesService', () => {
  let service: NotesService;
  let noteRepo: Repository<Note>;
  let revisionRepo: Repository<Revision>;
  let userRepo: Repository<User>;
  let forbiddenNoteId: string;

  /**
   * Creates a Note and a corresponding User and Group for testing.
   * The Note does not have any aliases.
   */
  async function getMockData(): Promise<[Note, User, Group]> {
    const user = User.create('hardcoded', 'Testy') as User;
    const author = Author.create(1);
    author.user = Promise.resolve(user);
    const group = Group.create('testGroup', 'testGroup', false) as Group;
    const content = 'testContent';
    jest
      .spyOn(noteRepo, 'save')
      .mockImplementation(async (note: Note): Promise<Note> => note);
    const note = await service.createNote(content, null);
    const revisions = await note.revisions;
    revisions[0].edits = Promise.resolve([
      {
        revisions: Promise.resolve(revisions),
        startPos: 0,
        endPos: 1,
        updatedAt: new Date(1549312452000),
        author: Promise.resolve(author),
      } as Edit,
      {
        revisions: Promise.resolve(revisions),
        startPos: 0,
        endPos: 1,
        updatedAt: new Date(1549312452001),
        author: Promise.resolve(author),
      } as Edit,
    ]);
    revisions[0].createdAt = new Date(1549312452000);
    jest.spyOn(revisionRepo, 'findOne').mockResolvedValue(revisions[0]);
    const createQueryBuilder = {
      innerJoin: () => createQueryBuilder,
      where: () => createQueryBuilder,
      getMany: () => [user],
    };
    jest
      .spyOn(userRepo, 'createQueryBuilder')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .mockImplementation(() => createQueryBuilder);
    note.publicId = 'testId';
    note.title = 'testTitle';
    note.description = 'testDescription';
    note.owner = Promise.resolve(user);
    note.userPermissions = Promise.resolve([
      {
        noteId: note.id,
        note: note,
        userId: user.id,
        user: user,
        canEdit: true,
      },
    ]);
    note.groupPermissions = Promise.resolve([
      {
        noteId: note.id,
        note: note,
        groupId: group.id,
        group: group,
        canEdit: true,
      },
    ]);
    note.tags = Promise.resolve([
      {
        id: 1,
        name: 'testTag',
        notes: Promise.resolve([note]),
      },
    ]);
    note.viewCount = 1337;

    return [note, user, group];
  }

  beforeEach(async () => {
    /**
     * We need to have *one* userRepo for both the providers array and
     * the overrideProvider call, as otherwise we have two instances
     * and the mock of createQueryBuilder replaces the wrong one
     * **/
    userRepo = new Repository<User>(
      '',
      new EntityManager(
        new DataSource({
          type: 'sqlite',
          database: ':memory:',
        }),
      ),
      undefined,
    );
    noteRepo = new Repository<Note>(
      '',
      new EntityManager(
        new DataSource({
          type: 'sqlite',
          database: ':memory:',
        }),
      ),
      undefined,
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        AliasService,
        {
          provide: getRepositoryToken(Note),
          useValue: noteRepo,
        },
        {
          provide: getRepositoryToken(Tag),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Alias),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
      ],
      imports: [
        LoggerModule,
        UsersModule,
        GroupsModule,
        RevisionsModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, databaseConfigMock, noteConfigMock],
        }),
      ],
    })
      .overrideProvider(getRepositoryToken(Note))
      .useValue(noteRepo)
      .overrideProvider(getRepositoryToken(Tag))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Alias))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepo)
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(NoteGroupPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteUserPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(Group))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
      .useValue({})
      .compile();

    const config = module.get<ConfigService>(ConfigService);
    forbiddenNoteId = config.get('noteConfig').forbiddenNoteIds[0];
    service = module.get<NotesService>(NotesService);
    noteRepo = module.get<Repository<Note>>(getRepositoryToken(Note));
    revisionRepo = module.get<Repository<Revision>>(
      getRepositoryToken(Revision),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserNotes', () => {
    describe('works', () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const alias = 'alias';
      const note = Note.create(user, alias) as Note;

      it('with no note', async () => {
        const createQueryBuilder = {
          where: () => createQueryBuilder,
          getMany: async () => {
            return null;
          },
        };
        jest
          .spyOn(noteRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        const notes = await service.getUserNotes(user);
        expect(notes).toEqual([]);
      });

      it('with one note', async () => {
        const createQueryBuilder = {
          where: () => createQueryBuilder,
          getMany: async () => {
            return [note];
          },
        };
        jest
          .spyOn(noteRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        const notes = await service.getUserNotes(user);
        expect(notes).toEqual([note]);
      });

      it('with multiple note', async () => {
        const createQueryBuilder = {
          where: () => createQueryBuilder,
          getMany: async () => {
            return [note, note];
          },
        };
        jest
          .spyOn(noteRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        const notes = await service.getUserNotes(user);
        expect(notes).toEqual([note, note]);
      });
    });
  });

  describe('createNote', () => {
    const user = User.create('hardcoded', 'Testy') as User;
    const alias = 'alias';
    const content = 'testContent';
    describe('works', () => {
      beforeEach(() => {
        jest
          .spyOn(noteRepo, 'save')
          .mockImplementation(async (note: Note): Promise<Note> => note);
      });
      it('without alias, without owner', async () => {
        const newNote = await service.createNote(content, null);
        const revisions = await newNote.revisions;
        expect(revisions).toHaveLength(1);
        expect(revisions[0].content).toEqual(content);
        expect(await newNote.historyEntries).toHaveLength(0);
        expect(await newNote.userPermissions).toHaveLength(0);
        expect(await newNote.groupPermissions).toHaveLength(0);
        expect(await newNote.tags).toHaveLength(0);
        expect(await newNote.owner).toBeNull();
        expect(await newNote.aliases).toHaveLength(0);
      });
      it('without alias, with owner', async () => {
        const newNote = await service.createNote(content, user);
        const revisions = await newNote.revisions;
        expect(revisions).toHaveLength(1);
        expect(revisions[0].content).toEqual(content);
        expect(await newNote.historyEntries).toHaveLength(1);
        expect((await newNote.historyEntries)[0].user).toEqual(user);
        expect(await newNote.userPermissions).toHaveLength(0);
        expect(await newNote.groupPermissions).toHaveLength(0);
        expect(await newNote.tags).toHaveLength(0);
        expect(await newNote.owner).toEqual(user);
        expect(await newNote.aliases).toHaveLength(0);
      });
      it('with alias, without owner', async () => {
        const newNote = await service.createNote(content, null, alias);
        const revisions = await newNote.revisions;
        expect(revisions).toHaveLength(1);
        expect(revisions[0].content).toEqual(content);
        expect(await newNote.historyEntries).toHaveLength(0);
        expect(await newNote.userPermissions).toHaveLength(0);
        expect(await newNote.groupPermissions).toHaveLength(0);
        expect(await newNote.tags).toHaveLength(0);
        expect(await newNote.owner).toBeNull();
        expect(await newNote.aliases).toHaveLength(1);
      });
      it('with alias, with owner', async () => {
        const newNote = await service.createNote(content, user, alias);
        const revisions = await newNote.revisions;
        expect(revisions).toHaveLength(1);
        expect(revisions[0].content).toEqual(content);
        expect(await newNote.historyEntries).toHaveLength(1);
        expect((await newNote.historyEntries)[0].user).toEqual(user);
        expect(await newNote.userPermissions).toHaveLength(0);
        expect(await newNote.groupPermissions).toHaveLength(0);
        expect(await newNote.tags).toHaveLength(0);
        expect(await newNote.owner).toEqual(user);
        expect(await newNote.aliases).toHaveLength(1);
        expect((await newNote.aliases)[0].name).toEqual(alias);
      });
    });
    describe('fails:', () => {
      it('alias is forbidden', async () => {
        await expect(
          service.createNote(content, null, forbiddenNoteId),
        ).rejects.toThrow(ForbiddenIdError);
      });

      it('alias is already used', async () => {
        jest.spyOn(noteRepo, 'save').mockImplementationOnce(async () => {
          throw new Error();
        });
        await expect(service.createNote(content, null, alias)).rejects.toThrow(
          AlreadyInDBError,
        );
      });
    });
  });

  describe('getNoteContent', () => {
    it('works', async () => {
      const content = 'testContent';
      jest
        .spyOn(noteRepo, 'save')
        .mockImplementation(async (note: Note): Promise<Note> => note);
      const newNote = await service.createNote(content, null);
      const revisions = await newNote.revisions;
      jest.spyOn(revisionRepo, 'findOne').mockResolvedValueOnce(revisions[0]);
      await service.getNoteContent(newNote).then((result) => {
        expect(result).toEqual(content);
      });
    });
  });

  describe('getNoteByIdOrAlias', () => {
    it('works', async () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const note = Note.create(user);
      const createQueryBuilder = {
        leftJoinAndSelect: () => createQueryBuilder,
        where: () => createQueryBuilder,
        orWhere: () => createQueryBuilder,
        setParameter: () => createQueryBuilder,
        getOne: () => note,
      };
      jest
        .spyOn(noteRepo, 'createQueryBuilder')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        .mockImplementation(() => createQueryBuilder);
      const foundNote = await service.getNoteByIdOrAlias('noteThatExists');
      expect(foundNote).toEqual(note);
    });
    describe('fails:', () => {
      it('no note found', async () => {
        const createQueryBuilder = {
          leftJoinAndSelect: () => createQueryBuilder,
          where: () => createQueryBuilder,
          orWhere: () => createQueryBuilder,
          setParameter: () => createQueryBuilder,
          getOne: () => null,
        };
        jest
          .spyOn(noteRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        await expect(
          service.getNoteByIdOrAlias('noteThatDoesNoteExist'),
        ).rejects.toThrow(NotInDBError);
      });
      it('id is forbidden', async () => {
        await expect(
          service.getNoteByIdOrAlias(forbiddenNoteId),
        ).rejects.toThrow(ForbiddenIdError);
      });
    });
  });

  describe('deleteNote', () => {
    it('works', async () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const note = Note.create(user) as Note;
      jest
        .spyOn(noteRepo, 'remove')
        .mockImplementationOnce(async (entry, _) => {
          expect(entry).toEqual(note);
          return entry;
        });
      await service.deleteNote(note);
    });
  });

  describe('updateNote', () => {
    it('works', async () => {
      const [note, ,] = await getMockData();
      const revisionLength = (await note.revisions).length;
      const updatedNote = await service.updateNote(note, 'newContent');
      expect(await updatedNote.revisions).toHaveLength(revisionLength + 1);
    });
  });

  describe('toTagList', () => {
    it('works', async () => {
      const note = {} as Note;
      note.tags = Promise.resolve([
        {
          id: 1,
          name: 'testTag',
          notes: Promise.resolve([note]),
        },
      ]);
      const tagList = await service.toTagList(note);
      expect(tagList).toHaveLength(1);
      expect(tagList[0]).toEqual((await note.tags)[0].name);
    });
  });

  describe('toNotePermissionsDto', () => {
    it('works', async () => {
      const [note, user, group] = await getMockData();
      const permissions = await service.toNotePermissionsDto(note);
      expect(permissions.owner).toEqual(user.username);
      expect(permissions.sharedToUsers).toHaveLength(1);
      expect(permissions.sharedToUsers[0].username).toEqual(user.username);
      expect(permissions.sharedToUsers[0].canEdit).toEqual(true);
      expect(permissions.sharedToGroups).toHaveLength(1);
      expect(permissions.sharedToGroups[0].groupName).toEqual(
        group.displayName,
      );
      expect(permissions.sharedToGroups[0].canEdit).toEqual(true);
    });
  });

  describe('toNoteMetadataDto', () => {
    it('works', async () => {
      const [note, user, group] = await getMockData();
      note.aliases = Promise.resolve([
        Alias.create('testAlias', note, true) as Alias,
      ]);

      const metadataDto = await service.toNoteMetadataDto(note);
      expect(metadataDto.id).toEqual(note.publicId);
      expect(metadataDto.aliases).toHaveLength(1);
      expect(metadataDto.aliases[0].name).toEqual((await note.aliases)[0].name);
      expect(metadataDto.primaryAddress).toEqual('testAlias');
      expect(metadataDto.title).toEqual(note.title);
      expect(metadataDto.description).toEqual(note.description);
      expect(metadataDto.editedBy).toHaveLength(1);
      expect(metadataDto.editedBy[0]).toEqual(user.username);
      expect(metadataDto.permissions.owner).toEqual(user.username);
      expect(metadataDto.permissions.sharedToUsers).toHaveLength(1);
      expect(metadataDto.permissions.sharedToUsers[0].username).toEqual(
        user.username,
      );
      expect(metadataDto.permissions.sharedToUsers[0].canEdit).toEqual(true);
      expect(metadataDto.permissions.sharedToGroups).toHaveLength(1);
      expect(metadataDto.permissions.sharedToGroups[0].groupName).toEqual(
        group.displayName,
      );
      expect(metadataDto.permissions.sharedToGroups[0].canEdit).toEqual(true);
      expect(metadataDto.tags).toHaveLength(1);
      expect(metadataDto.tags[0]).toEqual((await note.tags)[0].name);
      expect(metadataDto.updatedAt).toEqual(
        (await note.revisions)[0].createdAt,
      );
      expect(metadataDto.updateUsername).toEqual(user.username);
      expect(metadataDto.viewCount).toEqual(note.viewCount);
    });
    it('returns publicId if no alias exists', async () => {
      const [note, ,] = await getMockData();
      const metadataDto = await service.toNoteMetadataDto(note);
      expect(metadataDto.primaryAddress).toEqual(note.publicId);
    });
  });

  describe('toNoteDto', () => {
    it('works', async () => {
      const [note, user, group] = await getMockData();
      note.aliases = Promise.resolve([
        Alias.create('testAlias', note, true) as Alias,
      ]);

      const noteDto = await service.toNoteDto(note);
      expect(noteDto.metadata.id).toEqual(note.publicId);
      expect(noteDto.metadata.aliases).toHaveLength(1);
      expect(noteDto.metadata.aliases[0].name).toEqual(
        (await note.aliases)[0].name,
      );
      expect(noteDto.metadata.title).toEqual(note.title);
      expect(noteDto.metadata.description).toEqual(note.description);
      expect(noteDto.metadata.editedBy).toHaveLength(1);
      expect(noteDto.metadata.editedBy[0]).toEqual(user.username);
      expect(noteDto.metadata.permissions.owner).toEqual(user.username);
      expect(noteDto.metadata.permissions.sharedToUsers).toHaveLength(1);
      expect(noteDto.metadata.permissions.sharedToUsers[0].username).toEqual(
        user.username,
      );
      expect(noteDto.metadata.permissions.sharedToUsers[0].canEdit).toEqual(
        true,
      );
      expect(noteDto.metadata.permissions.sharedToGroups).toHaveLength(1);
      expect(noteDto.metadata.permissions.sharedToGroups[0].groupName).toEqual(
        group.displayName,
      );
      expect(noteDto.metadata.permissions.sharedToGroups[0].canEdit).toEqual(
        true,
      );
      expect(noteDto.metadata.tags).toHaveLength(1);
      expect(noteDto.metadata.tags[0]).toEqual((await note.tags)[0].name);
      expect(noteDto.metadata.updateUsername).toEqual(user.username);
      expect(noteDto.metadata.viewCount).toEqual(note.viewCount);
      expect(noteDto.content).toEqual('testContent');
    });
  });
});
