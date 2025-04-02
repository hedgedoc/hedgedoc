/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as MinioModule from 'minio';
import { Client, ClientOptions } from 'minio';
import { Mock } from 'ts-mockery';

import { MediaConfig } from '../../config/media.config';
import { ConsoleLoggerService } from '../../logger/console-logger.service';
import { BackendType } from './backend-type.enum';
import { S3Backend } from './s3-backend';

jest.mock('minio');
describe('s3 backend', () => {
  const mockedS3AccessKeyId = 'mockedS3AccessKeyId';
  const mockedS3SecretAccessKey = 'mockedS3SecretAccessKey';
  const mockedS3Bucket = 'mockedS3Bucket';
  const mockedUuid = 'cbe87987-8e70-4092-a879-878e70b09245';

  const mockedLoggerService = Mock.of<ConsoleLoggerService>({
    setContext: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  });

  let mockedClient: Client;
  let clientConstructorSpy: jest.SpyInstance<Client, [options: ClientOptions]>;

  beforeEach(() => {
    mockedClient = Mock.of<Client>({
      putObject: jest.fn(),
      removeObject: jest.fn(),
      presignedGetObject: jest.fn(),
    });

    clientConstructorSpy = jest
      .spyOn(MinioModule, 'Client')
      .mockImplementation(() => mockedClient);
  });

  function mockMediaConfig(endPoint: string): MediaConfig {
    return Mock.of<MediaConfig>({
      backend: {
        use: BackendType.S3,
        s3: {
          accessKeyId: mockedS3AccessKeyId,
          secretAccessKey: mockedS3SecretAccessKey,
          bucket: mockedS3Bucket,
          endpoint: endPoint,
        },
      },
    });
  }

  describe('constructor', () => {
    it('can be created with a valid https url without port', () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org');
      new S3Backend(mockedLoggerService, mediaConfig);
      expect(clientConstructorSpy).toHaveBeenCalledWith({
        endPoint: 's3.example.org',
        useSSL: true,
        port: undefined,
        accessKey: mockedS3AccessKeyId,
        secretKey: mockedS3SecretAccessKey,
      } as ClientOptions);
    });

    it('can be created with a valid https url with port', () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org:9000');
      new S3Backend(mockedLoggerService, mediaConfig);
      expect(clientConstructorSpy).toHaveBeenCalledWith({
        endPoint: 's3.example.org',
        useSSL: true,
        port: 9000,
        accessKey: mockedS3AccessKeyId,
        secretKey: mockedS3SecretAccessKey,
      } as ClientOptions);
    });

    it('can be created with a valid http url without port', () => {
      const mediaConfig = mockMediaConfig('http://s3.example.org');
      new S3Backend(mockedLoggerService, mediaConfig);
      expect(clientConstructorSpy).toHaveBeenCalledWith({
        endPoint: 's3.example.org',
        useSSL: false,
        port: undefined,
        accessKey: mockedS3AccessKeyId,
        secretKey: mockedS3SecretAccessKey,
      } as ClientOptions);
    });

    it('can be created with a valid http url with port', () => {
      const mediaConfig = mockMediaConfig('http://s3.example.org:9000');
      new S3Backend(mockedLoggerService, mediaConfig);
      expect(clientConstructorSpy).toHaveBeenCalledWith({
        endPoint: 's3.example.org',
        useSSL: false,
        port: 9000,
        accessKey: mockedS3AccessKeyId,
        secretKey: mockedS3SecretAccessKey,
      } as ClientOptions);
    });

    it('will treat every non-https endpoint as not secure', () => {
      const mediaConfig = mockMediaConfig('smtps://s3.example.org');
      new S3Backend(mockedLoggerService, mediaConfig);
      expect(clientConstructorSpy).toHaveBeenCalledWith({
        endPoint: 's3.example.org',
        useSSL: false,
        port: undefined,
        accessKey: mockedS3AccessKeyId,
        secretKey: mockedS3SecretAccessKey,
      } as ClientOptions);
    });

    it('will ignore paths in the endpoint', () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org/subpath');
      new S3Backend(mockedLoggerService, mediaConfig);
      expect(clientConstructorSpy).toHaveBeenCalledWith({
        endPoint: 's3.example.org',
        useSSL: true,
        port: undefined,
        accessKey: mockedS3AccessKeyId,
        secretKey: mockedS3SecretAccessKey,
      } as ClientOptions);
    });

    it('will crash if endpoint has no protocol', () => {
      const mediaConfig = mockMediaConfig('s3.example.org');
      expect(() => new S3Backend(mockedLoggerService, mediaConfig)).toThrow();
    });
  });

  describe('save', () => {
    it('can save a file', async () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org');
      const saveSpy = jest
        .spyOn(mockedClient, 'putObject')
        .mockImplementation(() =>
          Promise.resolve({
            etag: 'mock',
            versionId: 'mock',
          }),
        );

      const sut = new S3Backend(mockedLoggerService, mediaConfig);

      const mockedBuffer = Mock.of<Buffer>({});
      await sut.saveFile(mockedUuid, mockedBuffer, {
        mime: 'image/png',
        ext: 'png',
      });

      expect(saveSpy).toHaveBeenCalledWith(
        mockedS3Bucket,
        mockedUuid,
        mockedBuffer,
        mockedBuffer.length,
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'image/png',
        },
      );
    });

    it("will throw a MediaBackendError if the s3 client couldn't save the file", async () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org');
      const saveSpy = jest
        .spyOn(mockedClient, 'putObject')
        .mockImplementation(() => Promise.reject(new Error('mocked error')));

      const sut = new S3Backend(mockedLoggerService, mediaConfig);

      const mockedBuffer = Mock.of<Buffer>({});
      await expect(() =>
        sut.saveFile(mockedUuid, mockedBuffer, {
          mime: 'image/png',
          ext: 'png',
        }),
      ).rejects.toThrow(
        'Could not save file cbe87987-8e70-4092-a879-878e70b09245',
      );

      expect(saveSpy).toHaveBeenCalledWith(
        mockedS3Bucket,
        mockedUuid,
        mockedBuffer,
        mockedBuffer.length,
        {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'Content-Type': 'image/png',
        },
      );
    });
  });
  describe('delete', () => {
    it('can delete a file', async () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org');
      const deleteSpy = jest
        .spyOn(mockedClient, 'removeObject')
        .mockImplementation(() => Promise.resolve());

      const sut = new S3Backend(mockedLoggerService, mediaConfig);
      await sut.deleteFile(mockedUuid, null);

      expect(deleteSpy).toHaveBeenCalledWith(mockedS3Bucket, mockedUuid);
    });

    it("will throw a MediaBackendError if the client couldn't delete the file", async () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org');
      const deleteSpy = jest
        .spyOn(mockedClient, 'removeObject')
        .mockImplementation(() => Promise.reject(new Error('mocked error')));

      const sut = new S3Backend(mockedLoggerService, mediaConfig);

      await expect(() => sut.deleteFile(mockedUuid, null)).rejects.toThrow(
        'Could not delete file cbe87987-8e70-4092-a879-878e70b09245',
      );

      expect(deleteSpy).toHaveBeenCalledWith(mockedS3Bucket, mockedUuid);
    });
  });
  describe('getFileUrl', () => {
    it('returns a signed url', async () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org');
      const fileUrlSpy = jest
        .spyOn(mockedClient, 'presignedGetObject')
        .mockImplementation(() =>
          Promise.resolve(
            'https://s3.example.org/mockedS3Bucket/cbe87987-8e70-4092-a879-878e70b09245?mockedSignature',
          ),
        );

      const sut = new S3Backend(mockedLoggerService, mediaConfig);
      const url = await sut.getFileUrl(mockedUuid, null);

      expect(fileUrlSpy).toHaveBeenCalledWith(mockedS3Bucket, mockedUuid);
      expect(url).toBe(
        'https://s3.example.org/mockedS3Bucket/cbe87987-8e70-4092-a879-878e70b09245?mockedSignature',
      );
    });
    it('throws a MediaBackendError if the client could not generate a signed url', async () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org');
      const fileUrlSpy = jest
        .spyOn(mockedClient, 'presignedGetObject')
        .mockImplementation(() => {
          throw new Error('mocked error');
        });

      const sut = new S3Backend(mockedLoggerService, mediaConfig);

      await expect(() => sut.getFileUrl(mockedUuid, null)).rejects.toThrow(
        'Could not get URL for file cbe87987-8e70-4092-a879-878e70b09245',
      );

      expect(fileUrlSpy).toHaveBeenCalledWith(mockedS3Bucket, mockedUuid);
    });
  });
});
