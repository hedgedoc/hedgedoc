/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import databaseConfig, {
  MariadbDatabaseConfig,
  MySQLDatabaseConfig,
  PostgresDatabaseConfig,
  SqliteDatabaseConfig,
} from './database.config';

describe('databaseConfig', () => {
  const databaseTypeSqlite = 'sqlite';
  const databaseTypeMysql = 'mysql';
  const databaseTypeMariadb = 'mariadb';
  const databaseTypePostgres = 'postgres';
  const databaseName = 'test-db';
  const databaseUser = 'test-user';
  const databasePass = 'test-pass';
  const databaseHost = 'test-host';
  const databasePort = 1234;
  const invalidDatabasePort = -1234;
  const invalidDatabasePort2 = 65536;
  const databaseFileSqlite = 'test.db';

  describe('correctly parses valid', () => {
    it('SQLite config', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypeSqlite,
          HD_DATABASE_NAME: databaseFileSqlite,
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = databaseConfig() as SqliteDatabaseConfig;
      expect(config.type).toEqual(databaseTypeSqlite);
      expect(config.name).toEqual(databaseFileSqlite);
      restore();
    });

    it('MySQL config', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypeMysql,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_PORT: String(databasePort),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = databaseConfig() as MySQLDatabaseConfig;
      expect(config.type).toEqual(databaseTypeMysql);
      expect(config.name).toEqual(databaseName);
      expect(config.username).toEqual(databaseUser);
      expect(config.password).toEqual(databasePass);
      expect(config.host).toEqual(databaseHost);
      expect(config.port).toEqual(databasePort);
      restore();
    });

    it('MariaDB config', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypeMariadb,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_PORT: String(databasePort),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = databaseConfig() as MariadbDatabaseConfig;
      expect(config.type).toEqual(databaseTypeMariadb);
      expect(config.name).toEqual(databaseName);
      expect(config.username).toEqual(databaseUser);
      expect(config.password).toEqual(databasePass);
      expect(config.host).toEqual(databaseHost);
      expect(config.port).toEqual(databasePort);
      restore();
    });

    it('Postgres config', () => {
      const restore = mockedEnv(
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypePostgres,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_PORT: String(databasePort),
          /* eslint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = databaseConfig() as PostgresDatabaseConfig;
      expect(config.type).toEqual(databaseTypePostgres);
      expect(config.name).toEqual(databaseName);
      expect(config.username).toEqual(databaseUser);
      expect(config.password).toEqual(databasePass);
      expect(config.host).toEqual(databaseHost);
      expect(config.port).toEqual(databasePort);
      restore();
    });
  });

  it('throws an error if the port is negative', () => {
    const restore = mockedEnv(
      {
        /* eslint-disable @typescript-eslint/naming-convention */
        HD_DATABASE_TYPE: databaseTypePostgres,
        HD_DATABASE_NAME: databaseName,
        HD_DATABASE_USERNAME: databaseUser,
        HD_DATABASE_PASSWORD: databasePass,
        HD_DATABASE_HOST: databaseHost,
        HD_DATABASE_PORT: String(invalidDatabasePort),
        /* eslint-enable @typescript-eslint/naming-convention */
      },
      {
        clear: true,
      },
    );
    expect(() => databaseConfig()).toThrow(
      'HD_DATABASE_PORT: Number must be greater than 0',
    );
    restore();
  });
  it('throws an error if the port is too big', () => {
    const restore = mockedEnv(
      {
        /* eslint-disable @typescript-eslint/naming-convention */
        HD_DATABASE_TYPE: databaseTypePostgres,
        HD_DATABASE_NAME: databaseName,
        HD_DATABASE_USERNAME: databaseUser,
        HD_DATABASE_PASSWORD: databasePass,
        HD_DATABASE_HOST: databaseHost,
        HD_DATABASE_PORT: String(invalidDatabasePort2),
        /* eslint-enable @typescript-eslint/naming-convention */
      },
      {
        clear: true,
      },
    );
    expect(() => databaseConfig()).toThrow(
      'HD_DATABASE_PORT: Number must be less than or equal to 65535',
    );
    restore();
  });
});
