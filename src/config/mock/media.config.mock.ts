/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';

export default registerAs('mediaConfig', () => ({
  backend: {
    use: 'filesystem',
    filesystem: {
      uploadPath:
        'test_uploads' + Math.floor(Math.random() * 100000).toString(),
    },
  },
}));
