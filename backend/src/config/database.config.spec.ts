/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import mockedEnv from 'mocked-env';

import databaseConfig, {
  MariadbDatabaseConfig,
  PostgresDatabaseConfig,
  SqliteDatabaseConfig,
} from './database.config';

describe('databaseConfig', () => {
  const databaseTypeSqlite = 'sqlite';
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
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypeSqlite,
          HD_DATABASE_NAME: databaseFileSqlite,
          /* oxlint-enable @typescript-eslint/naming-convention */
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

    it('MariaDB config', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypeMariadb,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_PORT: String(databasePort),
          /* oxlint-enable @typescript-eslint/naming-convention */
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
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypePostgres,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_PORT: String(databasePort),
          /* oxlint-enable @typescript-eslint/naming-convention */
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

  describe('throws error', () => {
    let spyConsoleError: jest.SpyInstance;
    let spyProcessExit: jest.Mock;
    let originalProcess: typeof process;

    beforeEach(() => {
      spyConsoleError = jest.spyOn(console, 'error');
      spyProcessExit = jest.fn();
      originalProcess = global.process;
      global.process = {
        ...originalProcess,
        exit: spyProcessExit,
      } as unknown as typeof global.process;
    });

    afterEach(() => {
      global.process = originalProcess;
      jest.restoreAllMocks();
    });

    it('when the port is negative', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypePostgres,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_PORT: String(invalidDatabasePort),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      databaseConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_DATABASE_PORT: Number must be greater than 0',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });
    it('when the port is too big', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypePostgres,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_PORT: String(invalidDatabasePort2),
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      databaseConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'HD_DATABASE_PORT: Number must be less than or equal to 65535',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });
  });
});
