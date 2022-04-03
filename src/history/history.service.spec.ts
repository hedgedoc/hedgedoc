/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { AuthToken } from '../auth/auth-token.entity';
import { Author } from '../authors/author.entity';
import appConfigMock from '../config/mock/app.config.mock';
import noteConfigMock from '../config/mock/note.config.mock';
import { NotInDBError } from '../errors/errors';
import { Group } from '../groups/group.entity';
import { Identity } from '../identity/identity.entity';
import { LoggerModule } from '../logger/logger.module';
import { Alias } from '../notes/alias.entity';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { Tag } from '../notes/tag.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { Edit } from '../revisions/edit.entity';
import { Revision } from '../revisions/revision.entity';
import { Session } from '../users/session.entity';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { HistoryEntryImportDto } from './history-entry-import.dto';
import { HistoryEntry } from './history-entry.entity';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
  let service: HistoryService;
  let historyRepo: Repository<HistoryEntry>;
  let connection;
  let noteRepo: Repository<Note>;

  type MockConnection = {
    transaction: () => void;
  };

  function mockConnection(): MockConnection {
    return {
      transaction: jest.fn(),
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: getConnectionToken(),
          useFactory: mockConnection,
        },
        {
          provide: getRepositoryToken(HistoryEntry),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Note),
          useClass: Repository,
        },
      ],
      imports: [
        LoggerModule,
        UsersModule,
        NotesModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, noteConfigMock],
        }),
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(AuthToken))
      .useValue({})
      .overrideProvider(getRepositoryToken(Identity))
      .useValue({})
      .overrideProvider(getRepositoryToken(Edit))
      .useValue({})
      .overrideProvider(getRepositoryToken(Revision))
      .useValue({})
      .overrideProvider(getRepositoryToken(Note))
      .useClass(Repository)
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
    historyRepo = module.get<Repository<HistoryEntry>>(
      getRepositoryToken(HistoryEntry),
    );
    connection = module.get<Connection>(Connection);
    noteRepo = module.get<Repository<Note>>(getRepositoryToken(Note));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEntriesByUser', () => {
    describe('works', () => {
      it('with an empty list', async () => {
        jest.spyOn(historyRepo, 'find').mockResolvedValueOnce([]);
        expect(await service.getEntriesByUser({} as User)).toEqual([]);
      });

      it('with an one element list', async () => {
        const historyEntry = new HistoryEntry();
        jest.spyOn(historyRepo, 'find').mockResolvedValueOnce([historyEntry]);
        expect(await service.getEntriesByUser({} as User)).toEqual([
          historyEntry,
        ]);
      });

      it('with an multiple element list', async () => {
        const historyEntry = new HistoryEntry();
        const historyEntry2 = new HistoryEntry();
        jest
          .spyOn(historyRepo, 'find')
          .mockResolvedValueOnce([historyEntry, historyEntry2]);
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
        const createQueryBuilder = {
          where: () => createQueryBuilder,
          andWhere: () => createQueryBuilder,
          leftJoinAndSelect: () => createQueryBuilder,
          getOne: async () => {
            return null;
          },
        };
        jest
          .spyOn(historyRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        jest
          .spyOn(historyRepo, 'save')
          .mockImplementation(
            async (entry: HistoryEntry): Promise<HistoryEntry> => entry,
          );
        const createHistoryEntry = await service.updateHistoryEntryTimestamp(
          Note.create(user, alias) as Note,
          user,
        );
        expect(await createHistoryEntry.note.aliases).toHaveLength(1);
        expect((await createHistoryEntry.note.aliases)[0].name).toEqual(alias);
        expect(await createHistoryEntry.note.owner).toEqual(user);
        expect(createHistoryEntry.user).toEqual(user);
        expect(createHistoryEntry.pinStatus).toEqual(false);
      });

      it('with an preexisting entry', async () => {
        const createQueryBuilder = {
          where: () => createQueryBuilder,
          andWhere: () => createQueryBuilder,
          leftJoinAndSelect: () => createQueryBuilder,
          getOne: async () => {
            return historyEntry;
          },
        };
        jest
          .spyOn(historyRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        jest
          .spyOn(historyRepo, 'save')
          .mockImplementation(
            async (entry: HistoryEntry): Promise<HistoryEntry> => entry,
          );
        const createHistoryEntry = await service.updateHistoryEntryTimestamp(
          Note.create(user, alias) as Note,
          user,
        );
        expect(await createHistoryEntry.note.aliases).toHaveLength(1);
        expect((await createHistoryEntry.note.aliases)[0].name).toEqual(alias);
        expect(await createHistoryEntry.note.owner).toEqual(user);
        expect(createHistoryEntry.user).toEqual(user);
        expect(createHistoryEntry.pinStatus).toEqual(false);
        expect(createHistoryEntry.updatedAt.getTime()).toBeGreaterThanOrEqual(
          historyEntry.updatedAt.getTime(),
        );
      });
    });
  });

  describe('updateHistoryEntry', () => {
    const user = {} as User;
    const alias = 'alias';
    const note = Note.create(user, alias) as Note;
    beforeEach(() => {
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
    });
    describe('works', () => {
      it('with an entry', async () => {
        const historyEntry = HistoryEntry.create(user, note) as HistoryEntry;
        const createQueryBuilder = {
          where: () => createQueryBuilder,
          andWhere: () => createQueryBuilder,
          leftJoinAndSelect: () => createQueryBuilder,
          getOne: async () => {
            return historyEntry;
          },
        };
        jest
          .spyOn(historyRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        jest
          .spyOn(historyRepo, 'save')
          .mockImplementation(
            async (entry: HistoryEntry): Promise<HistoryEntry> => entry,
          );
        const updatedHistoryEntry = await service.updateHistoryEntry(
          note,
          user,
          {
            pinStatus: true,
          },
        );
        expect(await updatedHistoryEntry.note.aliases).toHaveLength(1);
        expect((await updatedHistoryEntry.note.aliases)[0].name).toEqual(alias);
        expect(await updatedHistoryEntry.note.owner).toEqual(user);
        expect(updatedHistoryEntry.user).toEqual(user);
        expect(updatedHistoryEntry.pinStatus).toEqual(true);
      });

      it('without an entry', async () => {
        const createQueryBuilder = {
          where: () => createQueryBuilder,
          andWhere: () => createQueryBuilder,
          leftJoinAndSelect: () => createQueryBuilder,
          getOne: async () => {
            return null;
          },
        };
        jest
          .spyOn(historyRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
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
        jest.spyOn(historyRepo, 'find').mockResolvedValueOnce([historyEntry]);
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
        jest
          .spyOn(historyRepo, 'find')
          .mockResolvedValueOnce([historyEntry, historyEntry2]);
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
        jest.spyOn(historyRepo, 'find').mockResolvedValueOnce([]);
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
        const historyQueryBuilder = {
          where: () => historyQueryBuilder,
          andWhere: () => historyQueryBuilder,
          leftJoinAndSelect: () => historyQueryBuilder,
          getOne: async () => {
            return historyEntry;
          },
        };
        jest
          .spyOn(historyRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => historyQueryBuilder);
        const noteQueryBuilder = {
          leftJoinAndSelect: () => noteQueryBuilder,
          where: () => noteQueryBuilder,
          orWhere: () => noteQueryBuilder,
          setParameter: () => noteQueryBuilder,
          getOne: () => note,
        };
        jest
          .spyOn(noteRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => noteQueryBuilder);
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
        const historyQueryBuilder = {
          where: () => historyQueryBuilder,
          andWhere: () => historyQueryBuilder,
          leftJoinAndSelect: () => historyQueryBuilder,
          getOne: async () => {
            return null;
          },
        };
        jest
          .spyOn(historyRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => historyQueryBuilder);
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
      const mockedManager = {
        find: jest.fn().mockResolvedValueOnce([historyEntry]),
        createQueryBuilder: () => createQueryBuilder,
        remove: jest
          .fn()
          .mockImplementationOnce(async (entry: HistoryEntry) => {
            expect(await entry.note.aliases).toHaveLength(1);
            expect((await entry.note.aliases)[0].name).toEqual(alias);
            expect(entry.pinStatus).toEqual(false);
          }),
        save: jest.fn().mockImplementationOnce((entry: HistoryEntry) => {
          expect(entry.note.aliases).toEqual(
            newlyCreatedHistoryEntry.note.aliases,
          );
          expect(entry.pinStatus).toEqual(newlyCreatedHistoryEntry.pinStatus);
          expect(entry.updatedAt).toEqual(newlyCreatedHistoryEntry.updatedAt);
        }),
      };
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      connection.transaction.mockImplementation((cb) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        cb(mockedManager);
      });
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
        note.title = title;
        note.tags = Promise.resolve(
          tags.map((tag) => {
            const newTag = new Tag();
            newTag.name = tag;
            return newTag;
          }),
        );
        const historyEntry = HistoryEntry.create(user, note) as HistoryEntry;
        historyEntry.pinStatus = true;
        const createQueryBuilder = {
          leftJoinAndSelect: () => createQueryBuilder,
          where: () => createQueryBuilder,
          orWhere: () => createQueryBuilder,
          getOne: () => note,
        };
        jest
          .spyOn(noteRepo, 'createQueryBuilder')
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .mockImplementation(() => createQueryBuilder);
        const historyEntryDto = await service.toHistoryEntryDto(historyEntry);
        expect(historyEntryDto.pinStatus).toEqual(true);
        expect(historyEntryDto.identifier).toEqual(alias);
        expect(historyEntryDto.tags).toEqual(tags);
        expect(historyEntryDto.title).toEqual(title);
      });
    });
  });
});
