/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';

import { DatabaseDialect } from '../database-dialect.enum';
import { DatabaseConfig } from '../database.config';

export default registerAs(
  'databaseConfig',
  (): DatabaseConfig => ({
    dialect: (process.env.HEDGEDOC_TEST_DB_TYPE || 'sqlite') as DatabaseDialect,
    database: 'hedgedoc',
    password: 'hedgedoc',
    host: 'localhost',
    port: 0,
    storage: '',
    username: 'hedgedoc',
  }),
);
