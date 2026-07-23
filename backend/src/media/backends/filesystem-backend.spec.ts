/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { describe, it, expect, beforeAll, beforeEach, jest } from '@jest/globals';
import { MediaBackendType } from '@hedgedoc/commons';
import { promises as fs } from 'fs';
import { Mock } from 'ts-mockery';

import { MediaConfig } from '../../config/media.config';
import { MediaBackendError } from '../../errors/errors';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { FilesystemBackend } from './filesystem-backend';

jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe('filesystem backend', () => {
  const mockedUploadPath = '/tmp/test_uploads';
  const mockedUuid = 'cbe87987-8e70-4092-a879-878e70b09245';
  const mockedBuffer = Buffer.from('test');

  const mockedLoggerService = Mock.of<ConsoleLoggerService>({
    setContext: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  });

  function mockMediaConfig(): MediaConfig {
    return Mock.of<MediaConfig>({
      backend: {
        type: MediaBackendType.FILESYSTEM,
        filesystem: {
          uploadPath: mockedUploadPath,
        },
      },
    });
  }

  let sut: FilesystemBackend;

  beforeAll(() => {
    sut = new FilesystemBackend(mockedLoggerService, mockMediaConfig());
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(fs, 'access').mockResolvedValue(undefined);
  });

  describe('saveFile', () => {
    it('writes the buffer to the expected path and returns the backend data', async () => {
      const writeFileSpy = jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const result = await sut.saveFile(mockedUuid, mockedBuffer, {
        mime: 'image/png',
        ext: 'png',
      });

      expect(writeFileSpy).toHaveBeenCalledWith(
        `${mockedUploadPath}/${mockedUuid}.png`,
        mockedBuffer,
        null,
      );
      expect(result).toBe(JSON.stringify({ ext: 'png', mime: 'image/png' }));
    });

    it('throws a MediaBackendError if the extension is not alphanumeric', async () => {
      const writeFileSpy = jest.spyOn(fs, 'writeFile');

      await expect(
        sut.saveFile(mockedUuid, mockedBuffer, { mime: 'image/png', ext: '../png' as never }),
      ).rejects.toThrow(new MediaBackendError('Invalid file extension: ../png'));
      expect(writeFileSpy).not.toHaveBeenCalled();
    });

    it('throws a MediaBackendError if the file could not be written', async () => {
      jest.spyOn(fs, 'writeFile').mockRejectedValue(new Error('mocked error'));

      await expect(
        sut.saveFile(mockedUuid, mockedBuffer, { mime: 'image/png', ext: 'png' }),
      ).rejects.toThrow(`Could not save file '${mockedUploadPath}/${mockedUuid}.png'`);
    });
  });

  describe('deleteFile', () => {
    it('unlinks the file at the expected path', async () => {
      const unlinkSpy = jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);

      await sut.deleteFile(mockedUuid, JSON.stringify({ ext: 'png' }));

      expect(unlinkSpy).toHaveBeenCalledWith(`${mockedUploadPath}/${mockedUuid}.png`);
    });

    it('throws a MediaBackendError if no backend data is provided', async () => {
      await expect(sut.deleteFile(mockedUuid, '')).rejects.toThrow('No backend data provided');
    });

    it('throws a MediaBackendError if the backend data has no extension', async () => {
      await expect(sut.deleteFile(mockedUuid, JSON.stringify({ ext: '' }))).rejects.toThrow(
        'No file extension in backend data',
      );
    });

    it('throws a MediaBackendError if the extension is not alphanumeric', async () => {
      const unlinkSpy = jest.spyOn(fs, 'unlink');

      await expect(sut.deleteFile(mockedUuid, JSON.stringify({ ext: '../png' }))).rejects.toThrow(
        new MediaBackendError('Invalid file extension: ../png'),
      );
      expect(unlinkSpy).not.toHaveBeenCalled();
    });

    it('throws a MediaBackendError if the file could not be deleted', async () => {
      jest.spyOn(fs, 'unlink').mockRejectedValue(new Error('mocked error'));

      await expect(sut.deleteFile(mockedUuid, JSON.stringify({ ext: 'png' }))).rejects.toThrow(
        `Could not delete file '${mockedUploadPath}/${mockedUuid}.png'`,
      );
    });
  });

  describe('getFileUrl', () => {
    it('returns the public media url for the file', async () => {
      await expect(sut.getFileUrl(mockedUuid, '')).resolves.toBe(`/media/${mockedUuid}`);
    });
  });

  describe('getFileResponse', () => {
    it('reads the file from disk and returns its content together with the mime type', async () => {
      const readFileSpy = jest.spyOn(fs, 'readFile').mockResolvedValue(mockedBuffer);

      const result = await sut.getFileResponse(
        mockedUuid,
        JSON.stringify({ ext: 'png', mime: 'image/png' }),
      );

      expect(readFileSpy).toHaveBeenCalledWith(`${mockedUploadPath}/${mockedUuid}.png`);
      expect(result).toEqual({
        buffer: mockedBuffer,
        contentType: 'image/png',
        fileName: `${mockedUuid}.png`,
      });
    });

    it('falls back to application/octet-stream if no mime type is stored', async () => {
      jest.spyOn(fs, 'readFile').mockResolvedValue(mockedBuffer);

      const result = await sut.getFileResponse(mockedUuid, JSON.stringify({ ext: 'png' }));

      expect(result.contentType).toBe('application/octet-stream');
    });

    it('throws a MediaBackendError if no backend data is provided', async () => {
      await expect(sut.getFileResponse(mockedUuid, null)).rejects.toThrow(
        'No backend data provided',
      );
    });

    it('throws a MediaBackendError if the backend data has no extension', async () => {
      await expect(
        sut.getFileResponse(mockedUuid, JSON.stringify({ ext: '', mime: 'image/png' })),
      ).rejects.toThrow('No file extension in backend data');
    });

    it('throws a MediaBackendError if the extension is not alphanumeric', async () => {
      const readFileSpy = jest.spyOn(fs, 'readFile');

      await expect(
        sut.getFileResponse(mockedUuid, JSON.stringify({ ext: '../png', mime: 'image/png' })),
      ).rejects.toThrow(new MediaBackendError('Invalid file extension: ../png'));
      expect(readFileSpy).not.toHaveBeenCalled();
    });
  });
});
