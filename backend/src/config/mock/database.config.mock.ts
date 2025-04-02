/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigFactoryKeyHost, registerAs } from '@nestjs/config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces';

import { DatabaseType } from '../database-type.enum';
import { DatabaseConfig } from '../database.config';

export function createDefaultMockDatabaseConfig(): DatabaseConfig {
  return {
    type: (process.env.HEDGEDOC_TEST_DB_TYPE ||
      DatabaseType.SQLITE) as DatabaseType,
    name: 'hedgedoc',
    password: 'hedgedoc',
    host: 'localhost',
    port: 0,
    username: 'hedgedoc',
  };
}

export function registerDatabaseConfig(
  databaseConfig: DatabaseConfig,
): ConfigFactory<DatabaseConfig> & ConfigFactoryKeyHost<DatabaseConfig> {
  return registerAs('databaseConfig', (): DatabaseConfig => databaseConfig);
}

export default registerDatabaseConfig(createDefaultMockDatabaseConfig());
