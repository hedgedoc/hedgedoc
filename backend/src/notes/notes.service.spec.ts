/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Mock } from 'ts-mockery';
import {
  DataSource,
  EntityManager,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

import { ApiToken } from '../api-token/api-token.entity';
import { Identity } from '../auth/identity.entity';
import { Author } from '../authors/author.entity';
import { DefaultAccessLevel } from '../config/default-access-level.enum';
import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import {
  createDefaultMockNoteConfig,
  registerNoteConfig,
} from '../config/mock/note.config.mock';
import { NoteConfig } from '../config/note.config';
import {
  AlreadyInDBError,
  ForbiddenIdError,
  MaximumDocumentLengthExceededError,
  NotInDBError,
} from '../errors/errors';
import { eventModuleConfig, NoteEvent } from '../events';
import { Group } from '../groups/group.entity';
import { GroupsModule } from '../groups/groups.module';
import { SpecialGroup } from '../groups/groups.special';
import { LoggerModule } from '../logger/logger.module';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { RealtimeNoteModule } from '../realtime/realtime-note/realtime-note.module';
import { Edit } from '../revisions/edit.entity';
import { Revision } from '../revisions/revision.entity';
import { RevisionsModule } from '../revisions/revisions.module';
import { RevisionsService } from '../revisions/revisions.service';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { mockSelectQueryBuilderInRepo } from '../utils/test-utils/mockSelectQueryBuilder';
import { Alias } from './alias.entity';
import { AliasService } from './alias.service';
import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { Tag } from './tag.entity';

jest.mock('../revisions/revisions.service');

describe('NotesService', () => {
  let service: NotesService;
  let revisionsService: RevisionsService;
  const noteMockConfig: NoteConfig = createDefaultMockNoteConfig();
  let noteRepo: Repository<Note>;
  let userRepo: Repository<User>;
  let aliasRepo: Repository<Alias>;
  let groupRepo: Repository<Group>;
  let forbiddenNoteId: string;
  let everyoneDefaultAccessPermission: string;
  let loggedinDefaultAccessPermission: string;
  let eventEmitter: EventEmitter2;
  const everyone = Group.create(
    SpecialGroup.EVERYONE,
    SpecialGroup.EVERYONE,
    true,
  );
  const loggedin = Group.create(
    SpecialGroup.LOGGED_IN,
    SpecialGroup.LOGGED_IN,
    true,
  );

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.resetModules();

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
    aliasRepo = new Repository<Alias>(
      '',
      new EntityManager(
        new DataSource({
          type: 'sqlite',
          database: ':memory:',
        }),
      ),
      undefined,
    );
    groupRepo = new Repository<Group>(
      '',
      new EntityManager(
        new DataSource({
          type: 'sqlite',
          database: ':memory:',
        }),
      ),
      undefined,
    );

    revisionsService = Mock.of<RevisionsService>({
      getLatestRevision: jest.fn(),
      createRevision: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: RevisionsService,
          useValue: revisionsService,
        },
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
          provide: getRepositoryToken(Revision),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Alias),
          useValue: aliasRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepo,
        },
        {
          provide: getRepositoryToken(Group),
          useValue: groupRepo,
        },
      ],
      imports: [
        LoggerModule,
        UsersModule,
        GroupsModule,
        RevisionsModule,
        RealtimeNoteModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            databaseConfigMock,
            authConfigMock,
            registerNoteConfig(noteMockConfig),
          ],
        }),
        EventEmitterModule.forRoot(eventModuleConfig),
      ],
    })
      .overrideProvider(getRepositoryToken(Note))
      .useValue(noteRepo)
      .overrideProvider(getRepositoryToken(Tag))
      .useClass(Repository)
      .overrideProvider(getRepositoryToken(Alias))
      .useValue(aliasRepo)
      .overrideProvider(getRepositoryToken(User))
      .useValue(userRepo)
      .overrideProvider(getRepositoryToken(ApiToken))
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
      .useValue(groupRepo)
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
      .useValue({})
      .compile();

    const config = module.get<ConfigService>(ConfigService);
    const noteConfig = config.get<NoteConfig>('noteConfig') as NoteConfig;
    forbiddenNoteId = noteConfig.forbiddenNoteIds[0];
    everyoneDefaultAccessPermission = noteConfig.permissions.default.everyone;
    loggedinDefaultAccessPermission = noteConfig.permissions.default.loggedIn;
    service = module.get<NotesService>(NotesService);
    noteRepo = module.get<Repository<Note>>(getRepositoryToken(Note));
    aliasRepo = module.get<Repository<Alias>>(getRepositoryToken(Alias));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  /**
   * Creates a Note and a corresponding User and Group for testing.
   * The Note does not have any aliases.
   */
  async function getMockData(): Promise<[Note, User, Group, Revision]> {
    const user = User.create('hardcoded', 'Testy') as User;
    const author = Author.create(1);
    author.user = Promise.resolve(user);
    const group = Group.create('testGroup', 'testGroup', false) as Group;
    jest
      .spyOn(noteRepo, 'save')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .mockImplementation(async (note: Note): Promise<Note> => note);
    mockGroupRepo();

    const revision = Mock.of<Revision>({
      edits: Promise.resolve([
        {
          startPos: 0,
          endPos: 1,
          updatedAt: new Date(1549312452000),
          author: Promise.resolve(author),
        } as Edit,
        {
          startPos: 0,
          endPos: 1,
          updatedAt: new Date(1549312452001),
          author: Promise.resolve(author),
        } as Edit,
      ]),
      createdAt: new Date(1549312452000),
      tags: Promise.resolve([
        {
          id: 0,
          name: 'tag1',
        } as Tag,
      ]),
      content: 'mockContent',
      description: 'mockDescription',
      title: 'mockTitle',
    });

    const note = Mock.of<Note>({
      revisions: Promise.resolve([revision]),
      aliases: Promise.resolve([]),
      createdAt: new Date(1549312452000),
    });

    mockRevisionService(note, revision);

    mockSelectQueryBuilderInRepo(userRepo, user);
    note.publicId = 'testId';
    note.owner = Promise.resolve(user);
    note.userPermissions = Promise.resolve([
      {
        id: 1,
        note: Promise.resolve(note),
        user: Promise.resolve(user),
        canEdit: true,
      },
    ]);
    note.groupPermissions = Promise.resolve([
      {
        id: 1,
        note: Promise.resolve(note),
        group: Promise.resolve(group),
        canEdit: true,
      },
    ]);
    note.viewCount = 1337;

    return [note, user, group, revision];
  }

  function mockRevisionService(note: Note, revision: Revision) {
    jest
      .spyOn(revisionsService, 'getLatestRevision')
      .mockImplementation((requestedNote) => {
        expect(requestedNote).toBe(note);
        return Promise.resolve(revision);
      });
  }

  function mockGroupRepo() {
    jest.spyOn(groupRepo, 'findOne').mockReset();
    jest.spyOn(groupRepo, 'findOne').mockImplementation((args) => {
      const groupName = (args.where as FindOptionsWhere<Group>).name;
      if (groupName === loggedin.name) {
        return Promise.resolve(loggedin as Group);
      } else if (groupName === everyone.name) {
        return Promise.resolve(everyone as Group);
      } else {
        return Promise.resolve(null);
      }
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserNotes', () => {
    describe('works', () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const alias = 'alias';
      const note = Note.create(user, alias) as Note;

      it('with no note', async () => {
        mockSelectQueryBuilderInRepo(noteRepo, null);
        const notes = await service.getUserNotes(user);
        expect(notes).toEqual([]);
      });

      it('with one note', async () => {
        mockSelectQueryBuilderInRepo(noteRepo, note);
        const notes = await service.getUserNotes(user);
        expect(notes).toEqual([note]);
      });

      it('with multiple note', async () => {
        mockSelectQueryBuilderInRepo(noteRepo, [note, note]);
        const notes = await service.getUserNotes(user);
        expect(notes).toEqual([note, note]);
      });
    });
  });

  describe('createNote', () => {
    const user = User.create('hardcoded', 'Testy') as User;
    const alias = 'alias';
    const content = 'testContent';
    const newRevision = Mock.of<Revision>({});
    let createRevisionSpy: jest.SpyInstance;

    describe('works', () => {
      beforeEach(() => {
        jest
          .spyOn(noteRepo, 'save')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(async (note: Note): Promise<Note> => note);
        jest.spyOn(noteRepo, 'existsBy').mockResolvedValueOnce(false);
        jest.spyOn(aliasRepo, 'existsBy').mockResolvedValueOnce(false);
        mockGroupRepo();

        createRevisionSpy = jest
          .spyOn(revisionsService, 'createRevision')
          .mockResolvedValue(newRevision);

        mockSelectQueryBuilderInRepo(noteRepo, null);
      });
      it('without alias, without owner', async () => {
        const newNote = await service.createNote(content, null);

        expect(createRevisionSpy).toHaveBeenCalledWith(newNote, content);
        expect(await newNote.revisions).toStrictEqual([newRevision]);
        expect(await newNote.historyEntries).toHaveLength(0);
        expect(await newNote.userPermissions).toHaveLength(0);
        const groupPermissions = await newNote.groupPermissions;
        expect(groupPermissions).toHaveLength(2);
        expect(groupPermissions[0].canEdit).toEqual(
          everyoneDefaultAccessPermission !==
            (DefaultAccessLevel.WRITE as string),
        );
        expect((await groupPermissions[0].group).name).toEqual(
          SpecialGroup.EVERYONE,
        );
        expect(groupPermissions[1].canEdit).toEqual(
          loggedinDefaultAccessPermission ===
            (DefaultAccessLevel.WRITE as string),
        );
        expect((await groupPermissions[1].group).name).toEqual(
          SpecialGroup.LOGGED_IN,
        );
        expect(await newNote.owner).toBeNull();
        expect(await newNote.aliases).toHaveLength(0);
      });
      it('without alias, with owner', async () => {
        const newNote = await service.createNote(content, user);
        expect(createRevisionSpy).toHaveBeenCalledWith(newNote, content);
        expect(await newNote.revisions).toStrictEqual([newRevision]);
        expect(await newNote.historyEntries).toHaveLength(1);
        expect(await (await newNote.historyEntries)[0].user).toEqual(user);
        expect(await newNote.userPermissions).toHaveLength(0);
        const groupPermissions = await newNote.groupPermissions;
        expect(groupPermissions).toHaveLength(2);
        expect(groupPermissions[0].canEdit).toEqual(
          everyoneDefaultAccessPermission ===
            (DefaultAccessLevel.WRITE as string),
        );
        expect((await groupPermissions[0].group).name).toEqual(
          SpecialGroup.EVERYONE,
        );
        expect(groupPermissions[1].canEdit).toEqual(
          loggedinDefaultAccessPermission ===
            (DefaultAccessLevel.WRITE as string),
        );
        expect((await groupPermissions[1].group).name).toEqual(
          SpecialGroup.LOGGED_IN,
        );
        expect(await newNote.owner).toEqual(user);
        expect(await newNote.aliases).toHaveLength(0);
      });
      it('with alias, without owner', async () => {
        const newNote = await service.createNote(content, null, alias);
        expect(createRevisionSpy).toHaveBeenCalledWith(newNote, content);
        expect(await newNote.revisions).toStrictEqual([newRevision]);
        expect(await newNote.historyEntries).toHaveLength(0);
        expect(await newNote.userPermissions).toHaveLength(0);
        const groupPermissions = await newNote.groupPermissions;
        expect(groupPermissions).toHaveLength(2);
        expect(groupPermissions[0].canEdit).toEqual(
          everyoneDefaultAccessPermission !==
            (DefaultAccessLevel.WRITE as string),
        );
        expect((await groupPermissions[0].group).name).toEqual(
          SpecialGroup.EVERYONE,
        );
        expect(groupPermissions[1].canEdit).toEqual(
          loggedinDefaultAccessPermission ===
            (DefaultAccessLevel.WRITE as string),
        );
        expect((await groupPermissions[1].group).name).toEqual(
          SpecialGroup.LOGGED_IN,
        );
        expect(await newNote.owner).toBeNull();
        expect(await newNote.aliases).toHaveLength(1);
      });
      it('with alias, with owner', async () => {
        const newNote = await service.createNote(content, user, alias);

        expect(createRevisionSpy).toHaveBeenCalledWith(newNote, content);
        expect(await newNote.revisions).toStrictEqual([newRevision]);
        expect(await newNote.historyEntries).toHaveLength(1);
        expect(await (await newNote.historyEntries)[0].user).toEqual(user);
        expect(await newNote.userPermissions).toHaveLength(0);
        const groupPermissions = await newNote.groupPermissions;
        expect(groupPermissions).toHaveLength(2);
        expect(groupPermissions[0].canEdit).toEqual(
          everyoneDefaultAccessPermission ===
            (DefaultAccessLevel.WRITE as string),
        );
        expect((await groupPermissions[0].group).name).toEqual(
          SpecialGroup.EVERYONE,
        );
        expect(groupPermissions[1].canEdit).toEqual(
          loggedinDefaultAccessPermission ===
            (DefaultAccessLevel.WRITE as string),
        );
        expect((await groupPermissions[1].group).name).toEqual(
          SpecialGroup.LOGGED_IN,
        );
        expect(await newNote.owner).toEqual(user);
        expect(await newNote.aliases).toHaveLength(1);
        expect((await newNote.aliases)[0].name).toEqual(alias);
      });
      describe('with maxDocumentLength 1000', () => {
        beforeEach(() => (noteMockConfig.maxDocumentLength = 1000));
        it('and content has length maxDocumentLength', async () => {
          const content = 'x'.repeat(noteMockConfig.maxDocumentLength);
          const newNote = await service.createNote(content, user, alias);

          expect(createRevisionSpy).toHaveBeenCalledWith(newNote, content);
          expect(await newNote.revisions).toStrictEqual([newRevision]);
          expect(await newNote.historyEntries).toHaveLength(1);
          expect(await (await newNote.historyEntries)[0].user).toEqual(user);
          expect(await newNote.userPermissions).toHaveLength(0);
          const groupPermissions = await newNote.groupPermissions;
          expect(groupPermissions).toHaveLength(2);
          expect(groupPermissions[0].canEdit).toEqual(
            everyoneDefaultAccessPermission ===
              (DefaultAccessLevel.WRITE as string),
          );
          expect((await groupPermissions[0].group).name).toEqual(
            SpecialGroup.EVERYONE,
          );
          expect(groupPermissions[1].canEdit).toEqual(
            loggedinDefaultAccessPermission ===
              (DefaultAccessLevel.WRITE as string),
          );
          expect((await groupPermissions[1].group).name).toEqual(
            SpecialGroup.LOGGED_IN,
          );
          expect(await newNote.owner).toEqual(user);
          expect(await newNote.aliases).toHaveLength(1);
          expect((await newNote.aliases)[0].name).toEqual(alias);
        });
      });
      describe('with other', () => {
        beforeEach(
          () =>
            (noteMockConfig.permissions.default.everyone =
              DefaultAccessLevel.NONE),
        );
        it('default permissions', async () => {
          mockGroupRepo();
          const newNote = await service.createNote(content, user, alias);

          expect(createRevisionSpy).toHaveBeenCalledWith(newNote, content);
          expect(await newNote.revisions).toStrictEqual([newRevision]);
          expect(await newNote.historyEntries).toHaveLength(1);
          expect(await (await newNote.historyEntries)[0].user).toEqual(user);
          expect(await newNote.userPermissions).toHaveLength(0);
          const groupPermissions = await newNote.groupPermissions;
          expect(groupPermissions).toHaveLength(1);
          expect(groupPermissions[0].canEdit).toEqual(
            loggedinDefaultAccessPermission ===
              (DefaultAccessLevel.WRITE as string),
          );
          expect((await groupPermissions[0].group).name).toEqual(
            SpecialGroup.LOGGED_IN,
          );
          expect(await newNote.owner).toEqual(user);
          expect(await newNote.aliases).toHaveLength(1);
          expect((await newNote.aliases)[0].name).toEqual(alias);
        });
      });
    });
    describe('fails:', () => {
      beforeEach(() => {
        mockSelectQueryBuilderInRepo(noteRepo, null);
      });

      it('alias is forbidden', async () => {
        jest.spyOn(noteRepo, 'existsBy').mockResolvedValueOnce(false);
        jest.spyOn(aliasRepo, 'existsBy').mockResolvedValueOnce(false);
        await expect(
          service.createNote(content, null, forbiddenNoteId),
        ).rejects.toThrow(ForbiddenIdError);
      });

      it('alias is already used (as another alias)', async () => {
        mockGroupRepo();
        jest.spyOn(noteRepo, 'existsBy').mockResolvedValueOnce(false);
        jest.spyOn(aliasRepo, 'existsBy').mockResolvedValueOnce(true);
        jest.spyOn(noteRepo, 'save').mockImplementationOnce(async () => {
          throw new Error();
        });
        await expect(service.createNote(content, null, alias)).rejects.toThrow(
          AlreadyInDBError,
        );
      });

      it('alias is already used (as publicId)', async () => {
        mockGroupRepo();
        jest.spyOn(noteRepo, 'existsBy').mockResolvedValueOnce(true);
        jest.spyOn(aliasRepo, 'existsBy').mockResolvedValueOnce(false);
        jest.spyOn(noteRepo, 'save').mockImplementationOnce(async () => {
          throw new Error();
        });
        await expect(service.createNote(content, null, alias)).rejects.toThrow(
          AlreadyInDBError,
        );
      });
      describe('with maxDocumentLength 1000', () => {
        beforeEach(() => (noteMockConfig.maxDocumentLength = 1000));
        it('document is too long', async () => {
          mockGroupRepo();
          jest.spyOn(noteRepo, 'existsBy').mockResolvedValueOnce(false);
          jest.spyOn(aliasRepo, 'existsBy').mockResolvedValueOnce(false);
          jest.spyOn(noteRepo, 'save').mockImplementationOnce(async () => {
            throw new Error();
          });
          const content = 'x'.repeat(noteMockConfig.maxDocumentLength + 1);
          await expect(
            service.createNote(content, user, alias),
          ).rejects.toThrow(MaximumDocumentLengthExceededError);
        });
      });
    });
  });

  describe('getNoteContent', () => {
    it('works', async () => {
      const content = 'testContent';
      const revision = Mock.of<Revision>({ content: content });
      const newNote = Mock.of<Note>();
      mockRevisionService(newNote, revision);
      const result = await service.getNoteContent(newNote);
      expect(result).toEqual(content);
    });
  });

  describe('getNoteByIdOrAlias', () => {
    it('works', async () => {
      const user = User.create('hardcoded', 'Testy') as User;
      const note = Note.create(user) as Note;
      mockSelectQueryBuilderInRepo(noteRepo, note);
      const foundNote = await service.getNoteByIdOrAlias('noteThatExists');
      expect(foundNote).toEqual(note);
    });
    describe('fails:', () => {
      it('no note found', async () => {
        mockSelectQueryBuilderInRepo(noteRepo, null);
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
      const mockedEventEmitter = jest
        .spyOn(eventEmitter, 'emit')
        .mockImplementationOnce((event) => {
          expect(event).toEqual(NoteEvent.DELETION);
          return true;
        });
      expect(mockedEventEmitter).not.toHaveBeenCalled();
      await service.deleteNote(note);
      expect(mockedEventEmitter).toHaveBeenCalled();
    });
  });

  describe('updateNote', () => {
    it('adds a new revision if content is different', async () => {
      const [note, , , revision] = await getMockData();

      const mockRevision = Mock.of<Revision>({});
      const createRevisionSpy = jest
        .spyOn(revisionsService, 'createRevision')
        .mockReturnValue(Promise.resolve(mockRevision));

      const newContent = 'newContent';
      const updatedNote = await service.updateNote(note, newContent);
      expect(await updatedNote.revisions).toStrictEqual([
        revision,
        mockRevision,
      ]);
      expect(createRevisionSpy).toHaveBeenCalledWith(note, newContent);
    });

    it("won't create a new revision if content is same", async () => {
      const [note, , , revision] = await getMockData();
      const createRevisionSpy = jest
        .spyOn(revisionsService, 'createRevision')
        .mockReturnValue(Promise.resolve(undefined));

      const newContent = 'newContent';
      const updatedNote = await service.updateNote(note, newContent);
      expect(await updatedNote.revisions).toStrictEqual([revision]);
      expect(createRevisionSpy).toHaveBeenCalledWith(note, newContent);
    });
  });

  describe('toNotePermissionsDto', () => {
    it('works', async () => {
      const [note] = await getMockData();
      const permissions = await service.toNotePermissionsDto(note);
      expect(permissions).toMatchSnapshot();
    });
  });

  describe('toNoteMetadataDto', () => {
    it('works', async () => {
      const [note] = await getMockData();
      note.aliases = Promise.resolve([
        Alias.create('testAlias', note, true) as Alias,
      ]);

      const metadataDto = await service.toNoteMetadataDto(note);
      expect(metadataDto).toMatchSnapshot();
    });

    it('returns publicId if no alias exists', async () => {
      const [note, ,] = await getMockData();
      const metadataDto = await service.toNoteMetadataDto(note);
      expect(metadataDto.primaryAddress).toEqual(note.publicId);
    });
  });

  describe('toNoteDto', () => {
    it('works', async () => {
      const [note] = await getMockData();
      note.aliases = Promise.resolve([
        Alias.create('testAlias', note, true) as Alias,
      ]);

      const noteDto = await service.toNoteDto(note);
      expect(noteDto).toMatchSnapshot();
    });
  });
});
