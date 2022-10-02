/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';

import { AppConfig } from '../app.config';
import { Loglevel } from '../loglevel.enum';

export default registerAs(
  'appConfig',
  (): AppConfig => ({
    domain: 'md.example.com',
    rendererBaseUrl: 'md-renderer.example.com',
    port: 3000,
    loglevel: Loglevel.ERROR,
    persistInterval: 10,
  }),
);
