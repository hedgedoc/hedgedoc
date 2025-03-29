/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import { BackendType } from '../media/backends/backend-type.enum';
import mediaConfig, {
  AzureMediaConfig,
  FilesystemMediaConfig,
  ImgurMediaConfig,
  S3MediaConfig,
  WebdavMediaConfig,
} from './media.config';

describe('mediaConfig', () => {
  // Filesystem
  const uploadPath = 'uploads';
  // S3
  const accessKeyId = 'accessKeyId';
  const secretAccessKey = 'secretAccessKey';
  const bucket = 'bucket';
  const endPoint = 'https://endPoint';
  const region = 'us-east-1';
  const pathStyle = false;
  // Azure
  const azureConnectionString = 'connectionString';
  const container = 'container';
  // Imgur
  const clientID = 'clientID';
  // Webdav
  const webdavConnectionString = 'https://example.com/webdav';
  const uploadDir = 'uploadDir';
  const publicUrl = 'https://example.com/images';

  describe('correctly parses config', () => {
    it('for backend filesystem', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_MEDIA_BACKEND: BackendType.FILESYSTEM,
          HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH: uploadPath,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = mediaConfig() as { backend: FilesystemMediaConfig };
      expect(config.backend.use).toEqual(BackendType.FILESYSTEM);
      expect(config.backend.filesystem.uploadPath).toEqual(uploadPath);
      restore();
    });

    it('for backend s3', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_MEDIA_BACKEND: BackendType.S3,
          HD_MEDIA_BACKEND_S3_ACCESS_KEY: accessKeyId,
          HD_MEDIA_BACKEND_S3_SECRET_KEY: secretAccessKey,
          HD_MEDIA_BACKEND_S3_BUCKET: bucket,
          HD_MEDIA_BACKEND_S3_ENDPOINT: endPoint,
          HD_MEDIA_BACKEND_S3_REGION: region,
          HD_MEDIA_BACKEND_S3_PATH_STYLE: pathStyle.toString(),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = mediaConfig() as { backend: S3MediaConfig };
      expect(config.backend.use).toEqual(BackendType.S3);
      expect(config.backend.s3.accessKeyId).toEqual(accessKeyId);
      expect(config.backend.s3.secretAccessKey).toEqual(secretAccessKey);
      expect(config.backend.s3.bucket).toEqual(bucket);
      expect(config.backend.s3.endpoint).toEqual(endPoint);
      expect(config.backend.s3.region).toEqual(region);
      expect(config.backend.s3.pathStyle).toEqual(pathStyle);
      restore();
    });

    it('for backend azure', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_MEDIA_BACKEND: BackendType.AZURE,
          HD_MEDIA_BACKEND_AZURE_CONNECTION_STRING: azureConnectionString,
          HD_MEDIA_BACKEND_AZURE_CONTAINER: container,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = mediaConfig() as { backend: AzureMediaConfig };
      expect(config.backend.use).toEqual(BackendType.AZURE);
      expect(config.backend.azure.connectionString).toEqual(
        azureConnectionString,
      );
      expect(config.backend.azure.container).toEqual(container);
      restore();
    });

    it('for backend imgur', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_MEDIA_BACKEND: BackendType.IMGUR,
          HD_MEDIA_BACKEND_IMGUR_CLIENT_ID: clientID,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = mediaConfig() as { backend: ImgurMediaConfig };
      expect(config.backend.use).toEqual(BackendType.IMGUR);
      expect(config.backend.imgur.clientId).toEqual(clientID);
      restore();
    });

    it('for backend webdav', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_MEDIA_BACKEND: BackendType.WEBDAV,
          HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING: webdavConnectionString,
          HD_MEDIA_BACKEND_WEBDAV_UPLOAD_DIR: uploadDir,
          HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL: publicUrl,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = mediaConfig() as { backend: WebdavMediaConfig };
      expect(config.backend.use).toEqual(BackendType.WEBDAV);
      expect(config.backend.webdav.connectionString).toEqual(
        webdavConnectionString,
      );
      expect(config.backend.webdav.uploadDir).toEqual(uploadDir);
      expect(config.backend.webdav.publicUrl).toEqual(publicUrl);
      restore();
    });
  });

  describe('throws error', () => {
    describe('for backend filesystem', () => {
      it('when HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH is not set', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.FILESYSTEM,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_FILESYSTEM_UPLOAD_PATH: Required',
        );
        restore();
      });
    });

    describe('for backend s3', () => {
      it('when HD_MEDIA_BACKEND_S3_ACCESS_KEY is not set', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.S3,
            HD_MEDIA_BACKEND_S3_SECRET_KEY: secretAccessKey,
            HD_MEDIA_BACKEND_S3_BUCKET: bucket,
            HD_MEDIA_BACKEND_S3_ENDPOINT: endPoint,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_S3_ACCESS_KEY_ID: Required',
        );
        restore();
      });
      it('when HD_MEDIA_BACKEND_S3_SECRET_KEY is not set', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.S3,
            HD_MEDIA_BACKEND_S3_ACCESS_KEY: accessKeyId,
            HD_MEDIA_BACKEND_S3_BUCKET: bucket,
            HD_MEDIA_BACKEND_S3_ENDPOINT: endPoint,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_S3_SECRET_ACCESS_KEY: Required',
        );
        restore();
      });
      it('when HD_MEDIA_BACKEND_S3_BUCKET is not set', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.S3,
            HD_MEDIA_BACKEND_S3_ACCESS_KEY: accessKeyId,
            HD_MEDIA_BACKEND_S3_SECRET_KEY: secretAccessKey,
            HD_MEDIA_BACKEND_S3_ENDPOINT: endPoint,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_S3_BUCKET: Required',
        );
        restore();
      });
      it('when HD_MEDIA_BACKEND_S3_ENDPOINT is not set', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.S3,
            HD_MEDIA_BACKEND_S3_ACCESS_KEY: accessKeyId,
            HD_MEDIA_BACKEND_S3_SECRET_KEY: secretAccessKey,
            HD_MEDIA_BACKEND_S3_BUCKET: bucket,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_S3_ENDPOINT: Required',
        );
        restore();
      });
      it('when HD_MEDIA_BACKEND_S3_ENDPOINT is not an URI', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.S3,
            HD_MEDIA_BACKEND_S3_ACCESS_KEY: accessKeyId,
            HD_MEDIA_BACKEND_S3_SECRET_KEY: secretAccessKey,
            HD_MEDIA_BACKEND_S3_BUCKET: bucket,
            HD_MEDIA_BACKEND_S3_ENDPOINT: 'wrong-uri',
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_S3_ENDPOINT: Invalid url',
        );
        restore();
      });
    });

    describe('for backend azure', () => {
      it('when HD_MEDIA_BACKEND_AZURE_CONNECTION_STRING is not set', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.AZURE,
            HD_MEDIA_BACKEND_AZURE_CONTAINER: container,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_AZURE_CONNECTION_STRING: Required',
        );
        restore();
      });
      it('when HD_MEDIA_BACKEND_AZURE_CONTAINER is not set', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.AZURE,
            HD_MEDIA_BACKEND_AZURE_CONNECTION_STRING: azureConnectionString,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_AZURE_CONTAINER: Required',
        );
        restore();
      });
    });

    describe('for backend imgur', () => {
      it('when HD_MEDIA_BACKEND_IMGUR_CLIENT_ID is not set', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.IMGUR,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_IMGUR_CLIENT_ID: Required',
        );
        restore();
      });
    });

    describe('for backend webdav', () => {
      it('when HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING is not set', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.WEBDAV,
            HD_MEDIA_BACKEND_WEBDAV_UPLOAD_DIR: uploadDir,
            HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL: publicUrl,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING: Required',
        );
        restore();
      });
      it('when HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING is not set to an url', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.WEBDAV,
            HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING: 'not-an-url',
            HD_MEDIA_BACKEND_WEBDAV_UPLOAD_DIR: uploadDir,
            HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL: publicUrl,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING: Invalid url',
        );
        restore();
      });
      it('when HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL is not set', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.WEBDAV,
            HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING: webdavConnectionString,
            HD_MEDIA_BACKEND_WEBDAV_UPLOAD_DIR: uploadDir,
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL: Required',
        );
        restore();
      });
      it('when HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL is not set to an url', async () => {
        const restore = mockedEnv(
          {
            /* eslint-disable @typescript-eslint/naming-convention */
            HD_MEDIA_BACKEND: BackendType.WEBDAV,
            HD_MEDIA_BACKEND_WEBDAV_CONNECTION_STRING: webdavConnectionString,
            HD_MEDIA_BACKEND_WEBDAV_UPLOAD_DIR: uploadDir,
            HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL: 'not-an-url',
            /* eslint-enable @typescript-eslint/naming-convention */
          },
          {
            clear: true,
          },
        );
        expect(() => mediaConfig()).toThrow(
          'HD_MEDIA_BACKEND_WEBDAV_PUBLIC_URL: Invalid url',
        );
        restore();
      });
    });
  });
});
