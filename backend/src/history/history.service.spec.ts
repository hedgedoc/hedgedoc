/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import assert from 'assert';
import { Mock } from 'ts-mockery';
import { DataSource, EntityManager, Repository } from 'typeorm';

import { ApiToken } from '../api-token/api-token.entity';
import { Identity } from '../auth/identity.entity';
import { Author } from '../authors/author.entity';
import appConfigMock from '../config/mock/app.config.mock';
import authConfigMock from '../config/mock/auth.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import { NotInDBError } from '../errors/errors';
import { eventModuleConfig } from '../events';
import { Group } from '../groups/group.entity';
import { LoggerModule } from '../logger/logger.module';
import { Alias } from '../notes/alias.entity';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Tag } from '../notes/tag.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Edit } from '../revisions/edit.entity';
import { Revision } from '../revisions/revision.entity';
import { RevisionsModule } from '../revisions/revisions.module';
import { RevisionsService } from '../revisions/revisions.service';
import { Session } from '../sessions/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { mockSelectQueryBuilderInRepo } from '../utils/test-utils/mockSelectQueryBuilder';
import { HistoryEntryImportDto } from './history-entry-import.dto';
import { HistoryEntry } from './history-entry.entity';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
  let service: HistoryService;
  let revisionsService: RevisionsService;
  let historyRepo: Repository<HistoryEntry>;
  let noteRepo: Repository<Note>;
  let mockedTransaction: jest.Mock<
    Promise<void>,
    [(entityManager: EntityManager) => Promise<void>]
  >;

  class CreateQueryBuilderClass {
    leftJoinAndSelect: () => CreateQueryBuilderClass;
    where: () => CreateQueryBuilderClass;
    orWhere: () => CreateQueryBuilderClass;
    setParameter: () => CreateQueryBuilderClass;
    getOne: () => HistoryEntry;
    getMany: () => HistoryEntry[];
  }

  let createQueryBuilderFunc: CreateQueryBuilderClass;

  beforeEach(async () => {
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
        HistoryService,
        {
          provide: getDataSourceToken(),
          useFactory: () => {
            mockedTransaction = jest.fn();
            return Mock.of<DataSource>({
              transaction: mockedTransaction,
            });
          },
        },
        {
          provide: getRepositoryToken(HistoryEntry),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Note),
          useValue: noteRepo,
        },
      ],
      imports: [
        LoggerModule,
        UsersModule,
        NotesModule,
        RevisionsModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            databaseConfigMock,
            authConfigMock,
            noteConfigMock,
          ],
        }),
        EventEmitterModule.forRoot(eventModuleConfig),
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(ApiToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useValue(noteRepo)
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteGroupPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(NoteUserPermission))
      .useValue({})
      .overrideProvider(getRepositoryToken(Group))
      .useValue({})
      .overrideProvider(getRepositoryToken(Session))
      .useValue({})
      .overrideProvider(getRepositoryToken(Author))
      .useValue({})
      .overrideProvider(getRepositoryToken(Alias))
      .useClass(Repository)
      .compile();

    service = module.get<HistoryService>(HistoryService);
    revisionsService = module.get<RevisionsService>(RevisionsService);
    historyRepo = module.get<Repository<HistoryEntry>>(
      getRepositoryToken(HistoryEntry),
    );
    noteRepo = module.get<Repository<Note>>(getRepositoryToken(Note));
    const historyEntry = new HistoryEntry();
    const createQueryBuilder = {
      leftJoinAndSelect: () => createQueryBuilder,
      where: () => createQueryBuilder,
      orWhere: () => createQueryBuilder,
      setParameter: () => createQueryBuilder,
      getOne: () => historyEntry,
      getMany: () => [historyEntry],
    };
    createQueryBuilderFunc = createQueryBuilder as CreateQueryBuilderClass;
    jest
      .spyOn(historyRepo, 'createQueryBuilder')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      .mockImplementation(() => createQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEntriesByUser', () => {
    describe('works', () => {
      it('with an empty list', async () => {
        createQueryBuilderFunc.getMany = () => [];
        expect(await service.getEntriesByUser({} as User)).toEqual([]);
      });

      it('with an one element list', async () => {
        const historyEntry = new HistoryEntry();
        createQueryBuilderFunc.getMany = () => [historyEntry];
        expect(await service.getEntriesByUser({} as User)).toEqual([
          historyEntry,
        ]);
      });

      it('with an multiple element list', async () => {
        const historyEntry = new HistoryEntry();
        const historyEntry2 = new HistoryEntry();
        createQueryBuilderFunc.getMany = () => [historyEntry, historyEntry2];
        expect(await service.getEntriesByUser({} as User)).toEqual([
          historyEntry,
          historyEntry2,
        ]);
      });
    });
  });

  describe('updateHistoryEntryTimestamp', () => {
    describe('works', () => {
      const user = {} as User;
      const alias = 'alias';
      const historyEntry = HistoryEntry.create(
        user,
        Note.create(user, alias) as Note,
      ) as HistoryEntry;
      it('without an preexisting entry', async () => {
        mockSelectQueryBuilderInRepo(historyRepo, null);
        jest
          .spyOn(historyRepo, 'save')
          .mockImplementation(
            async (entry): Promise<HistoryEntry> => entry as HistoryEntry,
          );
        const createHistoryEntry = await service.updateHistoryEntryTimestamp(
          Note.create(user, alias) as Note,
          user,
        );
        assert(createHistoryEntry != null);
        expect(await (await createHistoryEntry.note).aliases).toHaveLength(1);
        expect((await (await createHistoryEntry.note).aliases)[0].name).toEqual(
          alias,
        );
        expect(await (await createHistoryEntry.note).owner).toEqual(user);
        expect(await createHistoryEntry.user).toEqual(user);
        expect(createHistoryEntry.pinStatus).toEqual(false);
      });

      it('with an preexisting entry', async () => {
        mockSelectQueryBuilderInRepo(historyRepo, historyEntry);
        jest
          .spyOn(historyRepo, 'save')
          .mockImplementation(
            async (entry): Promise<HistoryEntry> => entry as HistoryEntry,
          );
        const createHistoryEntry = await service.updateHistoryEntryTimestamp(
          Note.create(user, alias) as Note,
          user,
        );
        assert(createHistoryEntry != null);
        expect(await (await createHistoryEntry.note).aliases).toHaveLength(1);
        expect((await (await createHistoryEntry.note).aliases)[0].name).toEqual(
          alias,
        );
        expect(await (await createHistoryEntry.note).owner).toEqual(user);
        expect(await createHistoryEntry.user).toEqual(user);
        expect(createHistoryEntry.pinStatus).toEqual(false);
        expect(createHistoryEntry.updatedAt.getTime()).toBeGreaterThanOrEqual(
          historyEntry.updatedAt.getTime(),
        );
      });
    });
    it('returns null if user is null', async () => {
      const entry = await service.updateHistoryEntryTimestamp({} as Note, null);
      expect(entry).toBeNull();
    });
  });

  describe('updateHistoryEntry', () => {
    const user = {} as User;
    const alias = 'alias';
    const note = Note.create(user, alias) as Note;
    beforeEach(() => {
      mockSelectQueryBuilderInRepo(noteRepo, note);
    });
    describe('works', () => {
      it('with an entry', async () => {
        const historyEntry = HistoryEntry.create(user, note) as HistoryEntry;
        mockSelectQueryBuilderInRepo(historyRepo, historyEntry);
        jest
          .spyOn(historyRepo, 'save')
          .mockImplementation(
            async (entry): Promise<HistoryEntry> => entry as HistoryEntry,
          );
        const updatedHistoryEntry = await service.updateHistoryEntry(
          note,
          user,
          {
            pinStatus: true,
          },
        );
        expect(await (await updatedHistoryEntry.note).aliases).toHaveLength(1);
        expect(
          (await (await updatedHistoryEntry.note).aliases)[0].name,
        ).toEqual(alias);
        expect(await (await updatedHistoryEntry.note).owner).toEqual(user);
        expect(await updatedHistoryEntry.user).toEqual(user);
        expect(updatedHistoryEntry.pinStatus).toEqual(true);
      });

      it('without an entry', async () => {
        mockSelectQueryBuilderInRepo(historyRepo, null);
        await expect(
          service.updateHistoryEntry(note, user, {
            pinStatus: true,
          }),
        ).rejects.toThrow(NotInDBError);
      });
    });
  });

  describe('deleteHistoryEntry', () => {
    describe('works', () => {
      const user = {} as User;
      const alias = 'alias';
      const note = Note.create(user, alias) as Note;
      const historyEntry = HistoryEntry.create(user, note) as HistoryEntry;
      it('with an entry', async () => {
        createQueryBuilderFunc.getMany = () => [historyEntry];
        jest
          .spyOn(historyRepo, 'remove')
          .mockImplementationOnce(
            async (entry: HistoryEntry): Promise<HistoryEntry> => {
              expect(entry).toEqual(historyEntry);
              return entry;
            },
          );
        await service.deleteHistory(user);
      });
      it('with multiple entries', async () => {
        const alias2 = 'alias2';
        const note2 = Note.create(user, alias2) as Note;
        const historyEntry2 = HistoryEntry.create(user, note2) as HistoryEntry;
        createQueryBuilderFunc.getMany = () => [historyEntry, historyEntry2];
        jest
          .spyOn(historyRepo, 'remove')
          .mockImplementationOnce(
            async (entry: HistoryEntry): Promise<HistoryEntry> => {
              expect(entry).toEqual(historyEntry);
              return entry;
            },
          )
          .mockImplementationOnce(
            async (entry: HistoryEntry): Promise<HistoryEntry> => {
              expect(entry).toEqual(historyEntry2);
              return entry;
            },
          );
        await service.deleteHistory(user);
      });
      it('without an entry', async () => {
        createQueryBuilderFunc.getMany = () => [];
        await service.deleteHistory(user);
        expect(true).toBeTruthy();
      });
    });
  });

  describe('deleteHistory', () => {
    describe('works', () => {
      it('with an entry', async () => {
        const user = {} as User;
        const alias = 'alias';
        const note = Note.create(user, alias) as Note;
        const historyEntry = HistoryEntry.create(user, note) as HistoryEntry;
        mockSelectQueryBuilderInRepo(historyRepo, historyEntry);
        mockSelectQueryBuilderInRepo(noteRepo, note);
        jest
          .spyOn(historyRepo, 'remove')
          .mockImplementation(
            async (entry: HistoryEntry): Promise<HistoryEntry> => {
              expect(entry).toEqual(historyEntry);
              return entry;
            },
          );
        await service.deleteHistoryEntry(note, user);
      });
    });
    describe('fails', () => {
      const user = {} as User;
      const alias = 'alias';
      it('without an entry', async () => {
        const note = Note.create(user, alias) as Note;

        mockSelectQueryBuilderInRepo(historyRepo, null);
        mockSelectQueryBuilderInRepo(noteRepo, note);
        await expect(service.deleteHistoryEntry(note, user)).rejects.toThrow(
          NotInDBError,
        );
      });
    });
  });

  describe('setHistory', () => {
    it('works', async () => {
      const user = {} as User;
      const alias = 'alias';
      const note = Note.create(user, alias) as Note;
      const historyEntry = HistoryEntry.create(user, note);
      const historyEntryImport: HistoryEntryImportDto = {
        lastVisitedAt: new Date('2020-12-01 12:23:34'),
        note: alias,
        pinStatus: true,
      };
      const newlyCreatedHistoryEntry: HistoryEntry = {
        ...historyEntry,
        pinStatus: historyEntryImport.pinStatus,
        updatedAt: historyEntryImport.lastVisitedAt,
      };

      mockSelectQueryBuilderInRepo(noteRepo, note);
      const createQueryBuilderForEntityManager = {
        where: () => createQueryBuilderForEntityManager,
        getMany: () => [historyEntry],
      };

      const mockedManager = Mock.of<EntityManager>({
        createQueryBuilder: jest
          .fn()
          .mockImplementation(() => createQueryBuilderForEntityManager),
        remove: jest
          .fn()
          .mockImplementationOnce(async (entry: HistoryEntry) => {
            expect(await (await entry.note).aliases).toHaveLength(1);
            expect((await (await entry.note).aliases)[0].name).toEqual(alias);
            expect(entry.pinStatus).toEqual(false);
          }),
        save: jest.fn().mockImplementationOnce(async (entry: HistoryEntry) => {
          expect((await entry.note).aliases).toEqual(
            (await newlyCreatedHistoryEntry.note).aliases,
          );
          expect(entry.pinStatus).toEqual(newlyCreatedHistoryEntry.pinStatus);
          expect(entry.updatedAt).toEqual(newlyCreatedHistoryEntry.updatedAt);
        }),
      });
      mockedTransaction.mockImplementation((cb) => cb(mockedManager));
      await service.setHistory(user, [historyEntryImport]);
    });
  });

  describe('toHistoryEntryDto', () => {
    describe('works', () => {
      it('with aliased note', async () => {
        const user = {} as User;
        const alias = 'alias';
        const title = 'title';
        const tags = ['tag1', 'tag2'];
        const note = Note.create(user, alias) as Note;
        const revision = Revision.create(
          '',
          '',
          note,
          null,
          '',
          '',
          [],
        ) as Revision;
        revision.title = title;
        revision.tags = Promise.resolve(
          tags.map((tag) => {
            const newTag = new Tag();
            newTag.name = tag;
            return newTag;
          }),
        );
        const historyEntry = HistoryEntry.create(user, note) as HistoryEntry;
        historyEntry.pinStatus = true;

        mockSelectQueryBuilderInRepo(noteRepo, note);
        jest
          .spyOn(revisionsService, 'getLatestRevision')
          .mockImplementation((requestedNote) => {
            expect(note).toBe(requestedNote);
            return Promise.resolve(revision);
          });

        const historyEntryDto = await service.toHistoryEntryDto(historyEntry);
        expect(historyEntryDto.pinStatus).toEqual(true);
        expect(historyEntryDto.identifier).toEqual(alias);
        expect(historyEntryDto.tags).toEqual(tags);
        expect(historyEntryDto.title).toEqual(title);
      });
    });
  });
});
