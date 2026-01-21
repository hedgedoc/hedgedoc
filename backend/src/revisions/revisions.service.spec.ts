/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  FieldNameAlias,
  FieldNameAuthorshipInfo,
  FieldNameRevision,
  FieldNameRevisionTag,
  FieldNameUser,
  NoteType,
  TableAlias,
  TableAuthorshipInfo,
  TableRevision,
  TableRevisionTag,
  TableUser,
} from '@hedgedoc/database';
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as diffModule from 'diff';
import type { Tracker } from 'knex-mock-client';
import * as uuidModule from 'uuid';

import { AliasService } from '../alias/alias.service';
import appConfigMock from '../config/mock/app.config.mock';
import { createDefaultMockNoteConfig, registerNoteConfig } from '../config/mock/note.config.mock';
import { NoteConfig } from '../config/note.config';
import { expectBindings } from '../database/mock/expect-bindings';
import { mockDelete, mockInsert, mockSelect, mockUpdate } from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import { GenericDBError, NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { dateTimeToDB, getCurrentDateTime } from '../utils/datetime';
import { RevisionsService } from './revisions.service';
import * as utilsExtractRevisionMetadataFromContentModule from './utils/extract-revision-metadata-from-content';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NoteEventMap } from '../events';

jest.mock('diff');
jest.mock('uuid');
jest.mock('./utils/extract-revision-metadata-from-content');

describe('RevisionsService', () => {
  let service: RevisionsService;
  let aliasService: AliasService;
  let tracker: Tracker;
  let knexProvider: Provider;
  let noteConfig: NoteConfig;

  const mockNoteId = 42;
  const mockPrimaryAlias = 'mock-note';
  const mockCreatedAt1 = '2012-05-25 09:08:34';
  const mockCreatedAt1Iso = '2012-05-25T09:08:34.000Z';
  const mockCreatedAt2 = '2025-09-23 18:04:08';
  const mockRevisionUuid1 = '84e72936-a851-4c4a-a729-36a851bc4a01';
  const mockRevisionUuid2 = '8573c04f-9e71-4b8f-b3c0-4f9e71db8ffd';
  const mockContent1 = 'Revision content';
  const mockContent2 = 'Revision content 2';
  const mockPatch = '---this-is-a-mock-patch---';
  const mockTitle = 'Note Title';
  const mockDescription = 'Note Description';
  const mockUsername = 'username';
  const mockGuestUuid = '9d1a0deb-fed1-45f0-9a0d-ebfed1e5f01f';
  const mockTag1 = 'tag1';
  const mockTag2 = 'tag2';

  jest.mock('diff');

  beforeAll(async () => {
    noteConfig = createDefaultMockNoteConfig();
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [RevisionsService, knexProvider, AliasService, EventEmitter2<NoteEventMap>],
      imports: [
        LoggerModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, registerNoteConfig(noteConfig)],
        }),
      ],
    }).compile();

    service = module.get<RevisionsService>(RevisionsService);
    aliasService = module.get<AliasService>(AliasService);
  });

  afterEach(() => {
    tracker.reset();
    jest.resetAllMocks();
    jest.resetModules();
  });

  it('getAllRevisionMetadataDto', async () => {
    mockSelect(
      tracker,
      [
        `${TableRevision}"."${FieldNameRevision.uuid}`,
        `${TableRevision}"."${FieldNameRevision.createdAt}`,
        `${TableRevision}"."${FieldNameRevision.description}`,
        `${TableRevision}"."${FieldNameRevision.content}`,
        `${TableRevision}"."${FieldNameRevision.title}`,
        `${TableUser}"."${FieldNameUser.username}`,
        `${TableUser}"."${FieldNameUser.guestUuid}`,
        `${TableRevisionTag}"."${FieldNameRevisionTag.tag}`,
      ],
      TableRevision,
      FieldNameRevision.noteId,
      [
        {
          [FieldNameRevision.uuid]: mockRevisionUuid1,
          [FieldNameRevision.createdAt]: mockCreatedAt1,
          [FieldNameRevision.content]: mockContent1,
          [FieldNameRevision.title]: mockTitle,
          [FieldNameRevision.description]: mockDescription,
          [FieldNameUser.username]: mockUsername,
          [FieldNameUser.guestUuid]: null,
          [FieldNameRevisionTag.tag]: mockTag1,
        },
      ],
      [
        {
          joinTable: TableRevisionTag,
          keyLeft: FieldNameRevisionTag.revisionUuid,
          keyRight: FieldNameRevision.uuid,
        },
        {
          joinTable: TableAuthorshipInfo,
          keyLeft: FieldNameAuthorshipInfo.revisionUuid,
          keyRight: FieldNameRevision.uuid,
        },
        {
          joinTable: TableUser,
          otherTable: TableAuthorshipInfo,
          keyLeft: FieldNameUser.id,
          keyRight: FieldNameAuthorshipInfo.authorId,
        },
      ],
    );
    const results = await service.getAllRevisionMetadataDto(mockNoteId);
    expect(results).toHaveLength(1);
    expect(results[0].uuid).toBe(mockRevisionUuid1);
    expect(results[0].createdAt).toBe(mockCreatedAt1Iso);
    expect(results[0].length).toBe(mockContent1.length);
    expect(results[0].authorUsernames).toHaveLength(1);
    expect(results[0].authorUsernames[0]).toBe(mockUsername);
    expect(results[0].authorGuestUuids).toHaveLength(0);
    expect(results[0].title).toBe(mockTitle);
    expect(results[0].description).toBe(mockDescription);
    expect(results[0].tags).toHaveLength(1);
    expect(results[0].tags[0]).toBe(mockTag1);
    expectBindings(tracker, 'select', [[mockNoteId]]);
  });

  describe('purgeRevisions', () => {
    let spyOnGetPrimaryAlias: jest.SpyInstance;
    // oxlint-disable-next-line func-style
    const buildMockSelect = (returnValues: unknown) => {
      mockSelect(tracker, [], TableRevision, [FieldNameRevision.noteId], returnValues);
    };

    beforeEach(() => {
      spyOnGetPrimaryAlias = jest.spyOn(aliasService, 'getPrimaryAliasByNoteId');
    });

    it('returns immediately, when there are no revisions', async () => {
      buildMockSelect([]);
      await service.purgeRevisions(mockNoteId);
      expect(spyOnGetPrimaryAlias).toHaveBeenCalledTimes(0);
      expectBindings(tracker, 'select', [[mockNoteId]]);
      expectBindings(tracker, 'delete', [[]], false, true);
      expectBindings(tracker, 'update', [[]], false, true);
    });
    it('correctly purges all, but the last revisions', async () => {
      // The typecast is required since jest does not see all signatures of the mocked function
      // and assumes using the first signature, which is wrong here and leads to a type error
      (
        jest.spyOn(diffModule, 'createPatch') as unknown as jest.MockedFunction<
          (a: string, b: string, c: string) => string
        >
      ).mockImplementation((a, b, c) => `${mockPatch}\n${a}\n${b}\n${c}`);
      buildMockSelect([
        {
          [FieldNameRevision.uuid]: mockRevisionUuid2,
          [FieldNameRevision.noteId]: mockNoteId,
          [FieldNameRevision.content]: mockContent2,
        },
        {
          [FieldNameRevision.uuid]: mockRevisionUuid1,
          [FieldNameRevision.noteId]: mockNoteId,
          [FieldNameRevision.content]: mockContent1,
        },
      ]);
      mockDelete(tracker, TableRevision, [FieldNameRevision.uuid], 1);
      mockUpdate(tracker, TableRevision, [FieldNameRevision.patch], FieldNameRevision.uuid, 1);
      spyOnGetPrimaryAlias.mockResolvedValueOnce(mockPrimaryAlias);
      await service.purgeRevisions(mockNoteId);
      expectBindings(tracker, 'select', [[mockNoteId]]);
      expectBindings(tracker, 'delete', [[mockRevisionUuid1]]);
      expectBindings(tracker, 'update', [
        [`${mockPatch}\n${mockPrimaryAlias}\n\n${mockContent2}`, mockRevisionUuid2],
      ]);
    });
  });

  describe('getRevisionDto', () => {
    it('throws a NotInDBError when revision is not found', async () => {
      mockSelect(
        tracker,
        [
          FieldNameRevision.uuid,
          FieldNameRevision.createdAt,
          FieldNameRevision.description,
          FieldNameRevision.content,
          FieldNameRevision.title,
          FieldNameRevision.patch,
        ],
        TableRevision,
        FieldNameRevision.uuid,
        [],
      );
      await expect(service.getRevisionDto(mockRevisionUuid1)).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'select', [[mockRevisionUuid1]], true);
    });

    it('correctly returns the fetched revision', async () => {
      mockSelect(
        tracker,
        [
          FieldNameRevision.uuid,
          FieldNameRevision.createdAt,
          FieldNameRevision.description,
          FieldNameRevision.content,
          FieldNameRevision.title,
          FieldNameRevision.patch,
        ],
        TableRevision,
        FieldNameRevision.uuid,
        [
          {
            [FieldNameRevision.uuid]: mockRevisionUuid1,
            [FieldNameRevision.noteId]: mockNoteId,
            [FieldNameRevision.patch]: mockPatch,
            [FieldNameRevision.content]: mockContent1,
            [FieldNameRevision.yjsStateVector]: null,
            [FieldNameRevision.noteType]: NoteType.DOCUMENT,
            [FieldNameRevision.title]: mockTitle,
            [FieldNameRevision.description]: mockDescription,
            [FieldNameRevision.createdAt]: mockCreatedAt1,
          },
        ],
      );
      const result = await service.getRevisionDto(mockRevisionUuid1);
      expect(result).toStrictEqual({
        uuid: mockRevisionUuid1,
        content: mockContent1,
        length: mockContent1.length,
        createdAt: mockCreatedAt1Iso,
        title: mockTitle,
        description: mockDescription,
        patch: mockPatch,
      });
      expectBindings(tracker, 'select', [[mockRevisionUuid1]], true);
    });
  });

  describe('getLatestRevision', () => {
    it('throws a NotInDBError when no revisions are found for the note', async () => {
      mockSelect(tracker, [], TableRevision, FieldNameRevision.noteId, []);
      await expect(service.getLatestRevision(mockNoteId)).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'select', [[mockNoteId]], true);
    });

    it('correctly returns the last revision', async () => {
      const mockRevision1 = {
        [FieldNameRevision.uuid]: mockRevisionUuid1,
        [FieldNameRevision.noteId]: mockNoteId,
        [FieldNameRevision.patch]: mockPatch,
        [FieldNameRevision.content]: mockContent1,
        [FieldNameRevision.yjsStateVector]: null,
        [FieldNameRevision.noteType]: NoteType.DOCUMENT,
        [FieldNameRevision.title]: mockTitle,
        [FieldNameRevision.description]: mockDescription,
        [FieldNameRevision.createdAt]: mockCreatedAt1,
      };
      const mockRevision2 = structuredClone(mockRevision1);
      mockRevision2[FieldNameRevision.uuid] = mockRevisionUuid2;
      mockRevision2[FieldNameRevision.createdAt] = mockCreatedAt2;
      mockSelect(tracker, [], TableRevision, FieldNameRevision.noteId, [
        mockRevision2,
        mockRevision1,
      ]);
      const result = await service.getLatestRevision(mockNoteId);
      expect(result).toStrictEqual(mockRevision2);
      expectBindings(tracker, 'select', [[mockNoteId]], true);
    });
  });

  it('getRevisionUserInfo', async () => {
    mockSelect(
      tracker,
      [
        `${TableUser}"."${FieldNameUser.username}`,
        `${TableUser}"."${FieldNameUser.guestUuid}`,
        `${TableAuthorshipInfo}"."${FieldNameAuthorshipInfo.createdAt}`,
        `${TableAuthorshipInfo}"."${FieldNameAuthorshipInfo.authorId}`,
      ],
      TableAuthorshipInfo,
      FieldNameAuthorshipInfo.revisionUuid,
      [
        {
          [FieldNameUser.username]: mockUsername,
          [FieldNameUser.guestUuid]: null,
          [FieldNameAuthorshipInfo.createdAt]: mockCreatedAt1,
          [FieldNameAuthorshipInfo.authorId]: 1,
        },
        {
          [FieldNameUser.username]: null,
          [FieldNameUser.guestUuid]: mockGuestUuid,
          [FieldNameAuthorshipInfo.createdAt]: mockCreatedAt2,
          [FieldNameAuthorshipInfo.authorId]: 2,
        },
      ],
      [
        {
          joinTable: TableUser,
          otherTable: TableAuthorshipInfo,
          keyLeft: FieldNameUser.id,
          keyRight: FieldNameAuthorshipInfo.authorId,
        },
      ],
    );
    const result = await service.getRevisionUserInfo(mockRevisionUuid1);
    expect(result.users).toHaveLength(1);
    expect(result.users[0].username).toBe(mockUsername);
    expect(result.users[0].createdAt).toBe(mockCreatedAt1);
    expect(result.guestUserCount).toBe(1);
    expectBindings(tracker, 'select', [[mockRevisionUuid1]]);
  });

  describe('createRevision', () => {
    const lastRevision = {
      [FieldNameRevision.uuid]: mockRevisionUuid1,
      [FieldNameRevision.noteId]: mockNoteId,
      [FieldNameRevision.patch]: mockPatch,
      [FieldNameRevision.content]: mockContent1,
      [FieldNameRevision.yjsStateVector]: null,
      [FieldNameRevision.noteType]: NoteType.DOCUMENT,
      [FieldNameRevision.title]: mockTitle,
      [FieldNameRevision.description]: mockDescription,
      [FieldNameRevision.createdAt]: mockCreatedAt1,
    };

    beforeEach(() => {
      jest.spyOn(service, 'getLatestRevision').mockResolvedValue(lastRevision);
      jest.spyOn(aliasService, 'getPrimaryAliasByNoteId').mockResolvedValue(mockPrimaryAlias);
      jest
        .spyOn(utilsExtractRevisionMetadataFromContentModule, 'extractRevisionMetadataFromContent')
        .mockReturnValue({
          title: mockTitle,
          description: mockDescription,
          tags: [],
          noteType: NoteType.DOCUMENT,
        });
      // This wrong typecast is required since TypeScript does not see that
      // `uuid.v7()` returns a string or a Uint8Array based on the given options
      jest.spyOn(uuidModule, 'v7').mockReturnValue(mockRevisionUuid1 as unknown as Uint8Array);
      // The typecast is required since jest does not see all signatures of the mocked function
      // and assumes using the first signature, which is wrong here and leads to a type error
      (
        jest.spyOn(diffModule, 'createPatch') as unknown as jest.MockedFunction<
          (a: string, b: string, c: string) => string
        >
      ).mockImplementation((a, b, c) => `${mockPatch}\n${a}\n${b}\n${c}`);
    });

    it('returns undefined when content did not change', async () => {
      jest.spyOn(service, 'getLatestRevision').mockResolvedValue(lastRevision);
      await expect(
        service.createRevision(mockNoteId, mockContent1, false),
      ).resolves.toBeUndefined();
    });

    it('uses a correct diff when an old revision is present', async () => {
      jest.useFakeTimers();
      const now = getCurrentDateTime();
      mockInsert(
        tracker,
        TableRevision,
        [
          FieldNameRevision.content,
          FieldNameRevision.createdAt,
          FieldNameRevision.description,
          FieldNameRevision.noteId,
          FieldNameRevision.noteType,
          FieldNameRevision.patch,
          FieldNameRevision.title,
          FieldNameRevision.uuid,
          FieldNameRevision.yjsStateVector,
        ],
        [mockRevisionUuid1],
      );
      await service.createRevision(mockNoteId, mockContent2, false);
      expectBindings(tracker, 'insert', [
        [
          mockContent2,
          dateTimeToDB(now),
          mockDescription,
          mockNoteId,
          NoteType.DOCUMENT,
          `${mockPatch}\n${mockPrimaryAlias}\n${mockContent1}\n${mockContent2}`,
          mockTitle,
          mockRevisionUuid1,
          null,
        ],
      ]);
      jest.useRealTimers();
    });
    it('creates a correct revision when no old revisions are present', async () => {
      jest.useFakeTimers();
      const now = getCurrentDateTime();
      mockInsert(
        tracker,
        TableRevision,
        [
          FieldNameRevision.content,
          FieldNameRevision.createdAt,
          FieldNameRevision.description,
          FieldNameRevision.noteId,
          FieldNameRevision.noteType,
          FieldNameRevision.patch,
          FieldNameRevision.title,
          FieldNameRevision.uuid,
          FieldNameRevision.yjsStateVector,
        ],
        [mockRevisionUuid1],
      );
      await service.createRevision(mockNoteId, mockContent1, true);
      expectBindings(tracker, 'insert', [
        [
          mockContent1,
          dateTimeToDB(now),
          mockDescription,
          mockNoteId,
          NoteType.DOCUMENT,
          `${mockPatch}\n${mockPrimaryAlias}\n\n${mockContent1}`,
          mockTitle,
          mockRevisionUuid1,
          null,
        ],
      ]);
      jest.useRealTimers();
    });
    it('throws a GenericDBError when the revision could not be inserted', async () => {
      mockInsert(
        tracker,
        TableRevision,
        [
          FieldNameRevision.content,
          FieldNameRevision.createdAt,
          FieldNameRevision.description,
          FieldNameRevision.noteId,
          FieldNameRevision.noteType,
          FieldNameRevision.patch,
          FieldNameRevision.title,
          FieldNameRevision.uuid,
          FieldNameRevision.yjsStateVector,
        ],
        [],
      );
      await expect(service.createRevision(mockNoteId, mockContent1, true)).rejects.toThrow(
        GenericDBError,
      );
    });
  });

  it('getTagsByRevisionUuid correctly returns tags', async () => {
    mockSelect(
      tracker,
      [FieldNameRevisionTag.tag],
      TableRevisionTag,
      FieldNameRevisionTag.revisionUuid,
      [
        {
          [FieldNameRevisionTag.tag]: mockTag1,
        },
        {
          [FieldNameRevisionTag.tag]: mockTag2,
        },
      ],
    );
    const results = await service.getTagsByRevisionUuid(mockRevisionUuid1);
    expect(results).toHaveLength(2);
    expect(results[0]).toBe(mockTag1);
    expect(results[1]).toBe(mockTag2);
    expectBindings(tracker, 'select', [[mockRevisionUuid1]]);
  });

  describe('removeOldRevisions', () => {
    const now = 1758653425;
    let expectedDateTime: string;
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(now);
      noteConfig.revisionRetentionDays = 1;
      expectedDateTime = dateTimeToDB(getCurrentDateTime().minus({ days: 1 }));
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    it("doesn't run if revisionRetentionDays is set to <= 0", async () => {
      noteConfig.revisionRetentionDays = 0;
      await service.removeOldRevisions();
      expectBindings(tracker, 'delete', [[]], false, true);
    });
    it("doesn't update if no revisions were removed", async () => {
      mockDelete(tracker, TableRevision, [FieldNameRevision.createdAt], []);
      mockSelect(
        tracker,
        [FieldNameRevision.noteId],
        TableRevision,
        [FieldNameRevision.createdAt],
        [],
      );
      await service.removeOldRevisions();
      expectBindings(tracker, 'delete', [[expectedDateTime]]);
      expectBindings(tracker, 'select', [[expectedDateTime]]);
    });
    it('updates notes if revisions were deleted', async () => {
      // The typecast is required since jest does not see all signatures of the mocked function
      // and assumes using the first signature, which is wrong here and leads to a type error
      (
        jest.spyOn(diffModule, 'createPatch') as unknown as jest.MockedFunction<
          (a: string, b: string, c: string) => string
        >
      ).mockImplementation((a, b, c) => `${mockPatch}\n${a}\n${b}\n${c}`);
      mockDelete(
        tracker,
        TableRevision,
        [FieldNameRevision.createdAt],
        [
          {
            [FieldNameRevision.noteId]: mockNoteId,
          },
        ],
      );
      mockSelect(
        tracker,
        [FieldNameRevision.noteId],
        TableRevision,
        [FieldNameRevision.createdAt],
        [
          {
            [FieldNameRevision.noteId]: mockNoteId,
          },
        ],
      );
      mockSelect(
        tracker,
        [
          FieldNameRevision.uuid,
          FieldNameRevision.noteId,
          FieldNameRevision.content,
          FieldNameAlias.alias,
        ],
        TableRevision,
        [FieldNameRevision.noteId, FieldNameAlias.isPrimary],
        [
          {
            [FieldNameRevision.uuid]: mockRevisionUuid1,
            [FieldNameRevision.noteId]: mockNoteId,
            [FieldNameRevision.content]: mockContent1,
            [FieldNameAlias.alias]: mockPrimaryAlias,
          },
        ],
        [
          {
            joinTable: TableAlias,
            keyLeft: FieldNameAlias.noteId,
            keyRight: FieldNameRevision.noteId,
          },
        ],
      );
      mockUpdate(tracker, TableRevision, [FieldNameRevision.patch], FieldNameRevision.uuid, 1);
      await service.removeOldRevisions();

      expectBindings(tracker, 'delete', [[expectedDateTime]]);
      expectBindings(tracker, 'select', [[expectedDateTime], [mockNoteId, true]]);
      expectBindings(tracker, 'update', [
        [`${mockPatch}\n${mockPrimaryAlias}\n\n${mockContent1}`, mockRevisionUuid1],
      ]);
    });
  });
});
