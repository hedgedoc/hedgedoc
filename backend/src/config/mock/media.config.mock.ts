/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MediaBackendType } from '@hedgedoc/commons';
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { MediaConfig } from '../media.config';

export function createDefaultMockMediaConfig(): MediaConfig {
  return {
    backend: {
      type: MediaBackendType.FILESYSTEM,
      filesystem: {
        uploadPath:
          'test_uploads' + Math.floor(Math.random() * 100000).toString(),
      },
    },
  };
}

export function registerMediaConfig(
  mediaConfig: MediaConfig,
): ConfigFactory<MediaConfig> & ConfigFactoryKeyHost<MediaConfig> {
  return registerAs('mediaConfig', (): MediaConfig => mediaConfig);
}

export default registerMediaConfig(createDefaultMockMediaConfig());
