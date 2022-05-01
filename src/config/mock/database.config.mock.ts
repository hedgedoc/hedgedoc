/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';

import { DatabaseType } from '../database-type.enum';
import { DatabaseConfig } from '../database.config';

export default registerAs(
  'databaseConfig',
  (): DatabaseConfig => ({
    type: (process.env.HEDGEDOC_TEST_DB_TYPE ||
      DatabaseType.SQLITE) as DatabaseType,
    database: 'hedgedoc',
    password: 'hedgedoc',
    host: 'localhost',
    port: 0,
    username: 'hedgedoc',
  }),
);
