/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, it, expect, beforeAll, afterEach, jest } from '@jest/globals';
import {
  FieldNameMediaUpload,
  FieldNameMediaUploadNote,
  MediaBackendType,
  TableMediaUpload,
  TableMediaUploadNote,
} from '@hedgedoc/database';
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as fileTypeModule from 'file-type';
import type { Tracker } from 'knex-mock-client';
import * as uuidModule from 'uuid';

import appConfigMock from '../config/mock/app.config.mock';
import databaseConfigMock from '../config/mock/database.config.mock';
import mediaConfigMock from '../config/mock/media.config.mock';
import { expectBindings } from '../database/mock/expect-bindings';
import { mockDelete, mockInsert, mockSelect } from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import { ClientError, NotInDBError } from '../errors/errors';
import { LoggerModule } from '../logger/logger.module';
import { PermissionService } from '../permissions/permission.service';
import { dateTimeToDB, getCurrentDateTime } from '../utils/datetime';
import { FilesystemBackend } from './backends/filesystem-backend';
import { MediaService } from './media.service';

jest.mock('file-type');
jest.mock('uuid');

describe('MediaService', () => {
  const userId = 1;
  const noteId = 2;
  const uuid = '0198c9b6-117f-7215-93e2-5ca4b718225f';
  const fileName = 'test.png';
  const backendType = MediaBackendType.FILESYSTEM;
  const backendData = JSON.stringify({ ext: 'png' });
  const fileBuffer = Buffer.from('test');
  const username = 'testuser';
  const createdAtIso = '2025-11-05T20:39:25.000Z';

  let service: MediaService;
  let fileSystemBackend: FilesystemBackend;
  let tracker: Tracker;
  let knexProvider: Provider;

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        knexProvider,
        FilesystemBackend,
        { provide: PermissionService, useValue: { canReadNote: jest.fn() } },
      ],
      imports: [
        LoggerModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [appConfigMock, databaseConfigMock, mediaConfigMock],
        }),
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    fileSystemBackend = module.get<FilesystemBackend>(FilesystemBackend);
  });

  afterEach(() => {
    tracker.reset();
    jest.clearAllMocks();
  });

  describe('isAllowedMimeType', () => {
    // ToDo: Add this test later
    // This is currently so trivial it isn't really worth it.
  });

  describe('saveFile', () => {
    it('inserts a new media upload and returns uuid', async () => {
      jest.useFakeTimers();
      const now = getCurrentDateTime();
      jest.spyOn(fileTypeModule, 'fromBuffer').mockResolvedValue({ mime: 'image/png', ext: 'png' });
      // This invalid Uint8Array typecast is required as TypeScript does not accept
      // that uuid.v7 can return either a string or Uint8Array based on the options.
      jest.spyOn(uuidModule, 'v7').mockReturnValue(uuid as unknown as Uint8Array);
      mockInsert(
        tracker,
        TableMediaUpload,
        [
          FieldNameMediaUpload.backendData,
          FieldNameMediaUpload.backendType,
          FieldNameMediaUpload.createdAt,
          FieldNameMediaUpload.fileName,
          FieldNameMediaUpload.userId,
          FieldNameMediaUpload.uuid,
        ],
        [{ [FieldNameMediaUpload.uuid]: uuid }],
      );
      mockInsert(
        tracker,
        TableMediaUploadNote,
        [FieldNameMediaUploadNote.mediaUploadUuid, FieldNameMediaUploadNote.noteId],
        [{ [FieldNameMediaUploadNote.mediaUploadUuid]: uuid }],
      );
      jest
        .spyOn(service.mediaBackend, 'saveFile')
        .mockImplementationOnce(
          async (
            givenUuid: string,
            buffer: Buffer,
            fileType?: fileTypeModule.FileTypeResult,
          ): Promise<string | null> => {
            expect(givenUuid).toBe(uuid);
            expect(buffer).toEqual(fileBuffer);
            expect(fileType).toBeDefined();
            expect(fileType!.ext).toEqual('png');
            return JSON.stringify({ ext: fileType!.ext });
          },
        );
      const result = await service.saveFile(fileName, fileBuffer, userId, noteId);
      expect(result).toBe(uuid);
      expectBindings(tracker, 'insert', [
        [backendData, backendType, dateTimeToDB(now), fileName, userId, uuid],
        [uuid, noteId],
      ]);
      jest.useRealTimers();
    });

    it('throws ClientError if file type is not detected', async () => {
      jest.spyOn(fileTypeModule, 'fromBuffer').mockResolvedValue(undefined);
      await expect(service.saveFile(fileName, fileBuffer, userId, noteId)).rejects.toThrow(
        ClientError,
      );
    });

    it('throws ClientError if mime type is not allowed', async () => {
      jest.spyOn(fileTypeModule, 'fromBuffer').mockResolvedValue({
        // correct MIME type for Windows exe would be
        // application/vnd.microsoft.portable-executable according to IANA,
        // but file-type detects it as the following
        mime: 'application/x-msdownload',
        ext: 'exe',
      });
      await expect(service.saveFile(fileName, fileBuffer, userId, noteId)).rejects.toThrow(
        ClientError,
      );
    });
  });

  describe('deleteFile', () => {
    it('deletes a file if found', async () => {
      mockSelect(
        tracker,
        [FieldNameMediaUpload.backendData],
        TableMediaUpload,
        FieldNameMediaUpload.uuid,
        { [FieldNameMediaUpload.backendData]: backendData },
      );
      mockDelete(tracker, TableMediaUpload, [FieldNameMediaUpload.uuid]);
      jest
        .spyOn(service.mediaBackend, 'deleteFile')
        .mockImplementationOnce(async (givenUuid: string, givenBackendData: string | null) => {
          expect(givenUuid).toBe(uuid);
          expect(givenBackendData).toBe(backendData);
        });
      await service.deleteFile(uuid);
      expectBindings(tracker, 'select', [[uuid]], true);
      expectBindings(tracker, 'delete', [[uuid]]);
    });

    it('throws NotInDBError if file not found', async () => {
      mockSelect(
        tracker,
        [FieldNameMediaUpload.backendData],
        TableMediaUpload,
        FieldNameMediaUpload.uuid,
        undefined,
      );
      await expect(service.deleteFile(uuid)).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'select', [[uuid]], true);
    });
  });

  describe('getFileUrl', () => {
    it('returns file url if found', async () => {
      mockSelect(
        tracker,
        [
          FieldNameMediaUpload.backendType,
          FieldNameMediaUpload.backendData],
        TableMediaUpload,
        FieldNameMediaUpload.uuid,
        {
          [FieldNameMediaUpload.backendType]: backendType,
          [FieldNameMediaUpload.backendData]: backendData,
        },
      );
      // As the media service loads the used backend dynamically, we need to
      // spy on fileSystemBackend here instead of service.mediaBackend
      jest
        .spyOn(fileSystemBackend, 'getFileUrl')
        .mockImplementationOnce(
          async (givenUuid: string, givenBackendData: string | null): Promise<string> => {
            expect(givenUuid).toBe(uuid);
            expect(givenBackendData).toBe(backendData);
            return `http://example.com/${fileName}`;
          },
        );
      const result = await service.getFileUrl(uuid);
      expect(result).toBe(`http://example.com/${fileName}`);
      expect(tracker.history.select).toHaveLength(1);
      expect(tracker.history.select[0].bindings).toEqual([uuid, 1]);
    });

    it('throws NotInDBError if not found', async () => {
      mockSelect(
        tracker,
        [
          FieldNameMediaUpload.backendType,
          FieldNameMediaUpload.backendData,
          FieldNameMediaUpload.fileName,
        ],
        TableMediaUpload,
        FieldNameMediaUpload.uuid,
        undefined,
      );
      await expect(service.getFileResponse(uuid)).rejects.toThrow(NotInDBError);
    });

    it('throws NotInDBError when given an invalid uuid', async () => {
      jest.spyOn(uuidModule, 'validate').mockReturnValueOnce(false);
      await expect(service.getFileResponse(invalidUuid)).rejects.toThrow(
        new NotInDBError('Invalid media upload id provided', 'MediaService', 'getFileResponse'),
      );
      expect(tracker.history.select).toHaveLength(0);
    });
  });

  describe('findUploadByUuid', () => {
    it('returns media upload if found', async () => {
      const row = { [FieldNameMediaUpload.uuid]: uuid };
      mockSelect(tracker, [], TableMediaUpload, FieldNameMediaUpload.uuid, row);
      const result = await service.findUploadByUuid(uuid);
      expect(result).toEqual(row);
      expectBindings(tracker, 'select', [[uuid]], true);
    });

    it('throws NotInDBError if not found', async () => {
      mockSelect(tracker, [], TableMediaUpload, FieldNameMediaUpload.uuid, undefined);
      await expect(service.findUploadByUuid(uuid)).rejects.toThrow(NotInDBError);
      expectBindings(tracker, 'select', [[uuid]], true);
    });
  });

  describe('getMediaUploadUuidsByUserId', () => {
    it('returns uuids for user', async () => {
      const rows = [{ [FieldNameMediaUpload.uuid]: uuid }];
      mockSelect(
        tracker,
        [FieldNameMediaUpload.uuid],
        TableMediaUpload,
        FieldNameMediaUpload.userId,
        rows,
      );
      const result = await service.getMediaUploadUuidsByUserId(userId);
      expect(result).toEqual([uuid]);
      expectBindings(tracker, 'select', [[userId]], false);
    });
  });

  describe('getMediaUploadUuidsByNoteId', () => {
    it('returns uuids for note', async () => {
      const rows = [{ [FieldNameMediaUploadNote.mediaUploadUuid]: uuid }];
      mockSelect(
        tracker,
        [FieldNameMediaUploadNote.mediaUploadUuid],
        TableMediaUploadNote,
        FieldNameMediaUploadNote.noteId,
        rows,
      );
      const result = await service.getMediaUploadUuidsByNoteId(noteId);
      expect(result).toEqual([uuid]);
    });
  });

  describe('removeNoteFromMediaUpload', () => {
    it('deletes note association', async () => {
      mockDelete(tracker, TableMediaUploadNote, [
        FieldNameMediaUploadNote.mediaUploadUuid,
        FieldNameMediaUploadNote.noteId,
      ]);
      await service.removeNoteFromMediaUpload(uuid, noteId);
      expectBindings(tracker, 'delete', [[uuid, noteId]]);
    });
  });

  describe('chooseBackendType', () => {
    // ToDo: Add this test later
    // This is currently so trivial it isn't really worth it.
  });

  describe('getBackendFromType', () => {
    // ToDo: Add this test later
    // This is currently so trivial it isn't really worth it.
  });

  describe('getMediaUploadDtosByUuids', () => {
    it('returns media upload dtos', async () => {
      const dtoSpy = jest.spyOn(service, 'getMediaUploadDtoByUuid').mockResolvedValueOnce({
        uuid,
        fileName,
        linkedNoteCount: 1,
        createdAt: createdAtIso,
        username,
      });
      const result = await service.getMediaUploadDtosByUuids([uuid]);
      expect(dtoSpy).toHaveBeenCalledWith(uuid);
      expect(result).toEqual([
        {
          uuid,
          fileName,
          linkedNoteCount: 1,
          createdAt: createdAtIso,
          username,
        },
      ]);
    });
  });
});
