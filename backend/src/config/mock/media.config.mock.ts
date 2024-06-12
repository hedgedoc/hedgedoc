/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { BackendType } from '../../media/backends/backend-type.enum';
import { MediaConfig } from '../media.config';

export function createDefaultMockMediaConfig(): MediaConfig {
  return {
    backend: {
      use: BackendType.FILESYSTEM,
      filesystem: {
        uploadPath:
          'test_uploads' + Math.floor(Math.random() * 100000).toString(),
      },
      s3: {
        accessKeyId: '',
        secretAccessKey: '',
        bucket: '',
        endPoint: '',
        pathStyle: false,
        region: '',
      },
      azure: {
        connectionString: '',
        container: '',
      },
      imgur: {
        clientID: '',
      },
      webdav: {
        connectionString: '',
        uploadDir: '',
        publicUrl: '',
      },
    },
  };
}

export function registerMediaConfig(
  appConfig: MediaConfig,
): ConfigFactory<MediaConfig> & ConfigFactoryKeyHost<MediaConfig> {
  return registerAs('mediaConfig', (): MediaConfig => appConfig);
}

export default registerMediaConfig(createDefaultMockMediaConfig());
