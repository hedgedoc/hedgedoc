/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as MinioModule from 'minio';
import { Client, ClientOptions, UploadedObjectInfo } from 'minio';
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
          endPoint: endPoint,
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
          Promise.resolve(Mock.of<UploadedObjectInfo>({})),
        );

      const sut = new S3Backend(mockedLoggerService, mediaConfig);

      const mockedBuffer = Mock.of<Buffer>({});
      const mockedFileName = 'mockedFileName';
      const [url, backendData] = await sut.saveFile(
        mockedBuffer,
        mockedFileName,
      );

      expect(saveSpy).toHaveBeenCalledWith(
        mockedS3Bucket,
        mockedFileName,
        mockedBuffer,
      );
      expect(url).toBe('https://s3.example.org/mockedS3Bucket/mockedFileName');
      expect(backendData).toBeNull();
    });

    it("will throw a MediaBackendError if the s3 client couldn't save the file", async () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org');
      const saveSpy = jest
        .spyOn(mockedClient, 'putObject')
        .mockImplementation(() => Promise.reject(new Error('mocked error')));

      const sut = new S3Backend(mockedLoggerService, mediaConfig);

      const mockedBuffer = Mock.of<Buffer>({});
      const mockedFileName = 'mockedFileName';
      await expect(() =>
        sut.saveFile(mockedBuffer, mockedFileName),
      ).rejects.toThrow("Could not save 'mockedFileName' on S3");

      expect(saveSpy).toHaveBeenCalledWith(
        mockedS3Bucket,
        mockedFileName,
        mockedBuffer,
      );
    });
  });
  describe('delete', () => {
    it('can delete a file', async () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org');
      const deleteSpy = jest
        .spyOn(mockedClient, 'removeObject')
        .mockImplementation(() => Promise.resolve());
      const mockedFileName = 'mockedFileName';

      const sut = new S3Backend(mockedLoggerService, mediaConfig);
      await sut.deleteFile(mockedFileName);

      expect(deleteSpy).toHaveBeenCalledWith(mockedS3Bucket, mockedFileName);
    });

    it("will throw a MediaBackendError if the client couldn't delete the file", async () => {
      const mediaConfig = mockMediaConfig('https://s3.example.org');
      const deleteSpy = jest
        .spyOn(mockedClient, 'removeObject')
        .mockImplementation(() => Promise.reject(new Error('mocked error')));
      const mockedFileName = 'mockedFileName';

      const sut = new S3Backend(mockedLoggerService, mediaConfig);

      await expect(() => sut.deleteFile(mockedFileName)).rejects.toThrow(
        "Could not delete 'mockedFileName' on S3",
      );

      expect(deleteSpy).toHaveBeenCalledWith(mockedS3Bucket, mockedFileName);
    });
  });
});
