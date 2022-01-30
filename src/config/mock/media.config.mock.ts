/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';

import { BackendType } from '../../media/backends/backend-type.enum';
import { MediaBackendConfig, MediaConfig } from '../media.config';

export default registerAs(
  'mediaConfig',
  (): Omit<MediaConfig, 'backend'> & {
    backend: Pick<MediaBackendConfig, 'use' | 'filesystem'>;
  } => ({
    backend: {
      use: BackendType.FILESYSTEM,
      filesystem: {
        uploadPath:
          'test_uploads' + Math.floor(Math.random() * 100000).toString(),
      },
    },
  }),
);
