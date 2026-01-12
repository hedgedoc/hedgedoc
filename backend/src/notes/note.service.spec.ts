/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';
import {
  FieldNameAlias,
  FieldNameNote,
  FieldNameRevision,
  NoteType,
  TableAlias,
  TableNote,
} from '@hedgedoc/database';
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import type { Tracker } from 'knex-mock-client';
import { DateTime } from 'luxon';

import { AliasService } from '../alias/alias.service';
import appConfigMock from '../config/mock/app.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import {
  createDefaultMockNoteConfig,
  registerNoteConfig,
} from '../config/mock/note.config.mock';
import { NoteConfig } from '../config/note.config';
import { expectBindings } from '../database/mock/expect-bindings';
import {
  mockDelete,
  mockInsert,
  mockSelect,
} from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import { NoteMetadataDto } from '../dtos/note-metadata.dto';
import {
  ForbiddenIdError,
  GenericDBError,
  MaximumDocumentLengthExceededError,
  NotInDBError,
} from '../errors/errors';
import { NoteEvent, NoteEventMap } from '../events';
import { GroupsService } from '../groups/groups.service';
import { LoggerModule } from '../logger/logger.module';
import { PermissionService } from '../permissions/permission.service';
import { RealtimeNoteStore } from '../realtime/realtime-note/realtime-note-store';
import { RevisionsService } from '../revisions/revisions.service';
import { UsersService } from '../users/users.service';
import { dateTimeToDB, getCurrentDateTime } from '../utils/datetime';
import { NoteService } from './note.service';

describe('NoteService', () => {
  let service: NoteService;
  const noteMockConfig: NoteConfig = createDefaultMockNoteConfig();
  let aliasService: AliasService;
  let eventEmitter: EventEmitter2<NoteEventMap>;
  let revisionService: RevisionsService;
  let realtimeNoteStore: RealtimeNoteStore;
  let groupsService: GroupsService;
  let permissionService: PermissionService;
  let tracker: Tracker;
  let knexProvider: Provider;

  const mockNoteId = 42;
  const mockOwnerUserId = 7;
  const mockNoteContent = 'Hello world!';
  const mockAliasCustom = 'my-alias';
  const mockAliasRandom = 'random-alias';
  const everyoneGroupId = 1;
  const loggedInGroupId = 1;
  const mockUsername = 'TestyMcTestface';
  const mockRevisionUuid = '0199110d-076f-7724-9229-bbeb32b53592';
  const mockCreatedAt = '2025-10-22 18:55:38';
  const mockCreatedAtIso = '2025-10-22T18:55:38.000Z';
  const mockUpdatedAt = '2025-10-22 19:34:21';
  const mockUpdatedAtIso = '2025-10-22T19:34:21.000Z';
  const mockNoteType = NoteType.DOCUMENT;
  const mockPatch = 'mockPatch';
  const mockNoteTitle = 'mockNoteTitle';
  const mockNoteDescription = 'mockNoteDescription';
  const mockTags = ['tag1', 'tag2'];
  const mockPermissions = {
    owner: mockUsername,
    publiclyVisible: false,
    sharedToUsers: [],
    sharedToGroups: [],
  };

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        knexProvider,
        GroupsService,
        RevisionsService,
        AliasService,
        PermissionService,
        RealtimeNoteStore,
        EventEmitter2<NoteEventMap>,
        UsersService,
      ],
      imports: [
        LoggerModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [
            appConfigMock,
            databaseConfigMock,
            registerNoteConfig(noteMockConfig),
          ],
        }),
      ],
    }).compile();

    service = module.get<NoteService>(NoteService);
    aliasService = module.get<AliasService>(AliasService);
    eventEmitter = module.get<EventEmitter2<NoteEventMap>>(
      EventEmitter2<NoteEventMap>,
    );
    revisionService = module.get<RevisionsService>(RevisionsService);
    realtimeNoteStore = module.get<RealtimeNoteStore>(RealtimeNoteStore);
    groupsService = module.get<GroupsService>(GroupsService);
    permissionService = module.get<PermissionService>(PermissionService);
  });

  afterEach(() => {
    tracker.reset();
    jest.restoreAllMocks();
  });

  describe('getUserNoteIds', () => {
    it('correctly returns the note ids', async () => {
      const rows = [
        {
          [FieldNameNote.id]: mockNoteId,
        },
      ];
      mockSelect(
        tracker,
        [FieldNameNote.id],
        TableNote,
        FieldNameNote.ownerId,
        rows,
      );
      const result = await service.getUserNoteIds(mockOwnerUserId);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockNoteId);
      expectBindings(tracker, 'select', [[mockOwnerUserId]]);
    });
  });

  describe('createNote', () => {
    let now: DateTime;
    beforeEach(() => {
      jest.useFakeTimers();
      now = getCurrentDateTime();
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    it('throws a MaximumDocumentLengthExceededError', async () => {
      const tooLongContent = 'a'.repeat(noteMockConfig.maxLength + 1);
      await expect(
        service.createNote(tooLongContent, mockOwnerUserId),
      ).rejects.toThrow(MaximumDocumentLengthExceededError);
    });

    it('throws GenericDBError if insert fails', async () => {
      mockInsert(
        tracker,
        TableNote,
        [
          FieldNameNote.createdAt,
          FieldNameNote.ownerId,
          FieldNameNote.publiclyVisible,
          FieldNameNote.version,
        ],
        [],
      );
      await expect(
        service.createNote(mockNoteContent, mockOwnerUserId, mockAliasCustom),
      ).rejects.toThrow(GenericDBError);
      expectBindings(tracker, 'insert', [
        [
          dateTimeToDB(now),
          mockOwnerUserId,
          noteMockConfig.permissions.default.publiclyVisible,
          2,
        ],
      ]);
    });

    /* oxlint-disable jest/no-conditional-expect */
    describe.each([
      [
        PermissionLevel.READ,
        PermissionLevel.WRITE,
        undefined,
        mockAliasRandom,
        'everyone read, loggedIn write, without alias',
      ],
      [
        PermissionLevel.DENY,
        PermissionLevel.READ,
        undefined,
        mockAliasRandom,
        'everyone denied, loggedIn read, without alias',
      ],
      [
        PermissionLevel.WRITE,
        PermissionLevel.DENY,
        undefined,
        mockAliasRandom,
        'everyone write, loggedIn denied, without alias',
      ],
      [
        PermissionLevel.READ,
        PermissionLevel.DENY,
        mockAliasCustom,
        mockAliasCustom,
        'everyone read, loggedIn denied, with alias',
      ],
    ])(
      'inserts a new note',
      (everyoneLevel, loggedInLevel, inputAlias, outputAlias, descr) => {
        let result: number;
        let mockEnsureAliasIsAvailable: jest.SpyInstance;
        let mockGenerateRandomAlias: jest.SpyInstance;
        let mockAddAlias: jest.SpyInstance;
        let mockCreateRevision: jest.SpyInstance;
        let mockGetGroupIdByName: jest.SpyInstance;
        let mockSetGroupPermission: jest.SpyInstance;
        beforeEach(() => {
          mockEnsureAliasIsAvailable = jest
            .spyOn(aliasService, 'ensureAliasIsAvailable')
            .mockImplementation(async () => {});
          mockGenerateRandomAlias = jest
            .spyOn(aliasService, 'generateRandomAlias')
            .mockImplementation(() => mockAliasRandom);
          mockAddAlias = jest
            .spyOn(aliasService, 'addAlias')
            .mockImplementation(async () => {});
          mockCreateRevision = jest
            .spyOn(revisionService, 'createRevision')
            .mockImplementation(async () => {});
          mockGetGroupIdByName = jest.spyOn(groupsService, 'getGroupIdByName');
          mockSetGroupPermission = jest
            .spyOn(permissionService, 'setGroupPermission')
            .mockImplementation(async () => {});
          mockInsert(
            tracker,
            TableNote,
            [
              FieldNameNote.createdAt,
              FieldNameNote.ownerId,
              FieldNameNote.publiclyVisible,
              FieldNameNote.version,
            ],
            [{ [FieldNameNote.id]: mockNoteId }],
          );
        });
        afterEach(() => {
          expect(mockCreateRevision).toHaveBeenCalledWith(
            mockNoteId,
            mockNoteContent,
            true,
            expect.anything(),
          );
          expect(result).toBe(mockNoteId);
          expectBindings(tracker, 'insert', [
            [
              dateTimeToDB(now),
              mockOwnerUserId,
              noteMockConfig.permissions.default.publiclyVisible,
              2,
            ],
          ]);
        });

        it(`with settings: ${descr}`, async () => {
          noteMockConfig.permissions.default.everyone = everyoneLevel as
            | PermissionLevel.DENY
            | PermissionLevel.READ
            | PermissionLevel.WRITE;
          noteMockConfig.permissions.default.loggedIn = loggedInLevel as
            | PermissionLevel.DENY
            | PermissionLevel.READ
            | PermissionLevel.WRITE;
          let numberOfGroupIdByNameCalls = 0;
          if (everyoneLevel !== PermissionLevel.DENY) {
            mockGetGroupIdByName.mockImplementationOnce(
              async () => everyoneGroupId,
            );
            numberOfGroupIdByNameCalls++;
          }
          if (loggedInLevel !== PermissionLevel.DENY) {
            mockGetGroupIdByName.mockImplementationOnce(
              async () => loggedInGroupId,
            );
            numberOfGroupIdByNameCalls++;
          }
          result = await service.createNote(
            mockNoteContent,
            mockOwnerUserId,
            inputAlias,
          );
          if (inputAlias === undefined) {
            expect(mockEnsureAliasIsAvailable).not.toHaveBeenCalled();
            expect(mockGenerateRandomAlias).toHaveBeenCalled();
          } else {
            expect(mockEnsureAliasIsAvailable).toHaveBeenCalledWith(
              outputAlias,
              expect.anything(),
            );
            expect(mockGenerateRandomAlias).not.toHaveBeenCalled();
          }
          expect(mockAddAlias).toHaveBeenCalledWith(
            mockNoteId,
            outputAlias,
            expect.anything(),
          );
          expect(mockGetGroupIdByName).toHaveBeenCalledTimes(
            numberOfGroupIdByNameCalls,
          );
          if (everyoneLevel !== PermissionLevel.DENY) {
            expect(mockSetGroupPermission).toHaveBeenCalledWith(
              mockNoteId,
              everyoneGroupId,
              everyoneLevel === PermissionLevel.WRITE,
              expect.anything(),
            );
          }
          if (loggedInLevel !== PermissionLevel.DENY) {
            expect(mockSetGroupPermission).toHaveBeenCalledWith(
              mockNoteId,
              loggedInGroupId,
              loggedInLevel === PermissionLevel.WRITE,
              expect.anything(),
            );
          }
        });
      },
    );
  });
  /* oxlint-enable jest/no-conditional-expect */

  describe('getNoteContent', () => {
    let realtimeNoteStoreSpy: jest.SpyInstance;
    let revsisionServiceSpy: jest.SpyInstance;

    beforeEach(() => {
      realtimeNoteStoreSpy = jest.spyOn(realtimeNoteStore, 'find');
      revsisionServiceSpy = jest.spyOn(revisionService, 'getLatestRevision');
    });
    it('returns content from RealtimeNoteStore if note is active', async () => {
      realtimeNoteStoreSpy.mockReturnValue({
        getRealtimeDoc: () => ({
          getCurrentContent: () => mockNoteContent,
        }),
      });
      const result = await service.getNoteContent(mockNoteId);
      expect(result).toEqual(mockNoteContent);
    });

    it('returns latest revision otherwise', async () => {
      realtimeNoteStoreSpy.mockReturnValue(undefined);
      revsisionServiceSpy.mockReturnValue({
        content: mockNoteContent,
      });
      const result = await service.getNoteContent(mockNoteId);
      expect(result).toEqual(mockNoteContent);
    });
  });

  describe('getNoteIdByAlias', () => {
    let aliasServiceSpy: jest.SpyInstance;
    // oxlint-disable-next-line func-style
    const buildMockSelect = (returnValues: unknown) => {
      mockSelect(
        tracker,
        [`${TableNote}"."${FieldNameNote.id}`],
        TableAlias,
        FieldNameAlias.alias,
        returnValues,
        [
          {
            joinTable: TableNote,
            keyLeft: FieldNameNote.id,
            keyRight: FieldNameAlias.noteId,
          },
        ],
      );
    };

    beforeEach(() => {
      aliasServiceSpy = jest.spyOn(aliasService, 'isAliasForbidden');
    });

    it('throws a ForbiddenIdError if the alias is forbidden', async () => {
      aliasServiceSpy.mockReturnValue(true);
      await expect(service.getNoteIdByAlias(mockAliasRandom)).rejects.toThrow(
        ForbiddenIdError,
      );
    });

    it('throws a NotInDBError if the note is not found', async () => {
      aliasServiceSpy.mockReturnValue(false);
      buildMockSelect([]);
      await expect(service.getNoteIdByAlias(mockAliasRandom)).rejects.toThrow(
        NotInDBError,
      );
      expectBindings(tracker, 'select', [[mockAliasRandom]], true);
    });

    it('returns the note id on success', async () => {
      aliasServiceSpy.mockReturnValue(false);
      buildMockSelect([
        {
          [FieldNameNote.id]: mockNoteId,
        },
      ]);
      const result = await service.getNoteIdByAlias(mockAliasRandom);
      expect(result).toEqual(mockNoteId);
      expectBindings(tracker, 'select', [[mockAliasRandom]], true);
    });
  });

  describe('deleteNote', () => {
    let eventEmitterSpy: jest.SpyInstance;
    beforeEach(() => {
      eventEmitterSpy = jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);
    });
    afterEach(() => {
      expect(eventEmitterSpy).toHaveBeenCalledWith(
        NoteEvent.DELETION,
        mockNoteId,
      );
    });
    it('throws NotInDBError if note not found', async () => {
      mockDelete(tracker, TableNote, [FieldNameNote.id], 0);
      await expect(service.deleteNote(mockNoteId)).rejects.toThrow(
        NotInDBError,
      );
      expectBindings(tracker, 'delete', [[mockNoteId]]);
    });

    it('deletes a note by id', async () => {
      mockDelete(tracker, TableNote, [FieldNameNote.id], 1);
      await service.deleteNote(mockNoteId);
      expectBindings(tracker, 'delete', [[mockNoteId]]);
    });
  });

  describe('updateNote', () => {
    let eventEmitterSpy: jest.SpyInstance;
    let revisionServiceSpy: jest.SpyInstance;
    beforeEach(() => {
      eventEmitterSpy = jest.spyOn(eventEmitter, 'emit').mockReturnValue(true);
      revisionServiceSpy = jest
        .spyOn(revisionService, 'createRevision')
        .mockImplementation(async () => {});
    });
    afterEach(() => {
      expect(eventEmitterSpy).toHaveBeenCalledWith(
        NoteEvent.CLOSE_REALTIME,
        mockNoteId,
      );
    });
    it('creates a new revision', async () => {
      await service.updateNote(mockNoteId, mockNoteContent);
      expect(revisionServiceSpy).toHaveBeenCalledWith(
        mockNoteId,
        mockNoteContent,
      );
    });
  });

  describe('toNoteMetadataDto', () => {
    let spyAliasService: jest.SpyInstance;

    beforeEach(() => {
      jest.useFakeTimers();
      spyAliasService = jest.spyOn(aliasService, 'getAllAliases');
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('throws NotInDBError if the note does not have a primary alias', async () => {
      spyAliasService.mockReturnValue([]);
      await expect(service.toNoteMetadataDto(mockNoteId)).rejects.toThrow(
        NotInDBError,
      );
    });
    it('throws NotInDBError if the note does not exist', async () => {
      spyAliasService.mockReturnValue([
        {
          [FieldNameAlias.alias]: mockAliasRandom,
          [FieldNameAlias.isPrimary]: true,
        },
        {
          [FieldNameAlias.alias]: mockAliasCustom,
          [FieldNameAlias.isPrimary]: false,
        },
      ]);
      mockSelect(
        tracker,
        [FieldNameNote.createdAt, FieldNameNote.version],
        TableNote,
        FieldNameNote.id,
        [],
      );
      await expect(service.toNoteMetadataDto(mockNoteId)).rejects.toThrow(
        NotInDBError,
      );
      expectBindings(tracker, 'select', [[mockNoteId]], true);
    });
    it('returns correct NoteMetadataDto', async () => {
      spyAliasService.mockReturnValue([
        {
          [FieldNameAlias.alias]: mockAliasRandom,
          [FieldNameAlias.isPrimary]: true,
        },
        {
          [FieldNameAlias.alias]: mockAliasCustom,
          [FieldNameAlias.isPrimary]: false,
        },
      ]);

      jest.spyOn(revisionService, 'getLatestRevision').mockResolvedValue({
        [FieldNameRevision.content]: mockNoteContent,
        [FieldNameRevision.uuid]: mockRevisionUuid,
        [FieldNameRevision.createdAt]: mockUpdatedAt,
        [FieldNameRevision.noteId]: mockNoteId,
        [FieldNameRevision.noteType]: mockNoteType,
        [FieldNameRevision.patch]: mockPatch,
        [FieldNameRevision.title]: mockNoteTitle,
        [FieldNameRevision.description]: mockNoteDescription,
        [FieldNameRevision.yjsStateVector]: null,
      });
      jest
        .spyOn(revisionService, 'getTagsByRevisionUuid')
        .mockResolvedValue(mockTags);
      jest
        .spyOn(permissionService, 'getPermissionsDtoForNote')
        .mockResolvedValue(mockPermissions);
      jest.spyOn(revisionService, 'getRevisionUserInfo').mockResolvedValue({
        users: [
          {
            username: mockUsername,
            createdAt: mockUpdatedAt,
          },
        ],
        guestUserCount: 0,
      });

      mockSelect(
        tracker,
        [FieldNameNote.createdAt, FieldNameNote.version],
        TableNote,
        FieldNameNote.id,
        [
          {
            [FieldNameNote.version]: 2,
            [FieldNameNote.createdAt]: mockCreatedAt,
          },
        ],
      );
      const result = await service.toNoteMetadataDto(mockNoteId);
      expectBindings(tracker, 'select', [[mockNoteId]], true);
      expect(result).toEqual({
        aliases: [mockAliasRandom, mockAliasCustom],
        primaryAlias: mockAliasRandom,
        title: mockNoteTitle,
        description: mockNoteDescription,
        tags: mockTags,
        createdAt: mockCreatedAtIso,
        editedBy: [mockUsername],
        permissions: mockPermissions,
        version: 2,
        updatedAt: mockUpdatedAtIso,
        lastUpdatedBy: mockUsername,
      });
    });
  });
  describe('toNoteDto', () => {
    it('correctly calls other methods', async () => {
      const mockNoteMetadata: NoteMetadataDto = NoteMetadataDto.create({
        aliases: [mockAliasRandom, mockAliasCustom],
        primaryAlias: mockAliasRandom,
        title: mockNoteTitle,
        description: mockNoteDescription,
        tags: mockTags,
        createdAt: mockCreatedAtIso,
        editedBy: [mockUsername],
        permissions: mockPermissions,
        version: 2,
        updatedAt: mockUpdatedAtIso,
        lastUpdatedBy: mockUsername,
      });
      jest.spyOn(service, 'getNoteContent').mockResolvedValue(mockNoteContent);
      jest
        .spyOn(service, 'toNoteMetadataDto')
        .mockResolvedValue(mockNoteMetadata);
      const result = await service.toNoteDto(mockNoteId);
      expect(result).toEqual({
        content: mockNoteContent,
        metadata: mockNoteMetadata,
        editedByAtPosition: [],
      });
    });
  });
});
