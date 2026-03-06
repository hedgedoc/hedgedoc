/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import * as utilsModule from './utils';
import mockedEnv from 'mocked-env';

import databaseConfig, {
  getKnexConfig,
  MariadbDatabaseConfig,
  PostgresDatabaseConfig,
  SqliteDatabaseConfig,
} from './database.config';
import { TEST_CERT_FILE_CONTENT } from './shared-test-data';

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

    it('MariaDB config with TLS defaults when not enabled', () => {
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
      expect(config.tls.enabled).toBe(false);
      expect(config.tls.rejectUnauthorized).toBe(true);
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

    it('Postgres config with TLS enabled', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypePostgres,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_PORT: String(databasePort),
          HD_DATABASE_TLS_ENABLED: 'true',
          HD_DATABASE_TLS_REJECT_UNAUTHORIZED: 'false',
          HD_DATABASE_TLS_CIPHERS: 'TLS_AES_256_GCM_SHA384',
          HD_DATABASE_TLS_MIN_VERSION: 'TLSv1.2',
          HD_DATABASE_TLS_MAX_VERSION: 'TLSv1.3',
          HD_DATABASE_TLS_PASSPHRASE: 'test-passphrase',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = databaseConfig() as PostgresDatabaseConfig;
      expect(config.tls.enabled).toBe(true);
      expect(config.tls.rejectUnauthorized).toBe(false);
      expect(config.tls.ciphers).toEqual('TLS_AES_256_GCM_SHA384');
      expect(config.tls.minVersion).toEqual('TLSv1.2');
      expect(config.tls.maxVersion).toEqual('TLSv1.3');
      expect(config.tls.passphrase).toEqual('test-passphrase');
      restore();
    });

    it('Postgres config with TLS certificate paths', () => {
      jest.spyOn(utilsModule, 'readOptionalFileContents').mockReturnValue(TEST_CERT_FILE_CONTENT);

      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypePostgres,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_TLS_ENABLED: 'true',
          HD_DATABASE_TLS_CA_PATH: '/path/to/ca.pem',
          HD_DATABASE_TLS_CERT_PATH: '/path/to/cert.pem',
          HD_DATABASE_TLS_KEY_PATH: '/path/to/key.pem',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = databaseConfig() as PostgresDatabaseConfig;
      expect(config.tls.enabled).toBe(true);
      expect(config.tls.caPath).toEqual('/path/to/ca.pem');
      expect(config.tls.certPath).toEqual('/path/to/cert.pem');
      expect(config.tls.keyPath).toEqual('/path/to/key.pem');

      const knexConfig = getKnexConfig(config);
      const connection = knexConfig.connection as Record<string, unknown>;
      const ssl = connection.ssl as Record<string, unknown>;
      expect(ssl.ca).toEqual(TEST_CERT_FILE_CONTENT);
      expect(ssl.cert).toEqual(TEST_CERT_FILE_CONTENT);
      expect(ssl.key).toEqual(TEST_CERT_FILE_CONTENT);

      restore();
      jest.restoreAllMocks();
    });

    it('MariaDB config with TLS enabled', () => {
      jest.spyOn(utilsModule, 'readOptionalFileContents').mockReturnValue(TEST_CERT_FILE_CONTENT);

      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypeMariadb,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_TLS_ENABLED: 'true',
          HD_DATABASE_TLS_CA_PATH: '/path/to/ca.pem',
          HD_DATABASE_TLS_CIPHERS: 'TLS_AES_256_GCM_SHA384',
          HD_DATABASE_TLS_REJECT_UNAUTHORIZED: 'true',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = databaseConfig() as MariadbDatabaseConfig;
      expect(config.tls.enabled).toBe(true);

      const knexConfig = getKnexConfig(config);
      const connection = knexConfig.connection as Record<string, unknown>;
      const ssl = connection.ssl as Record<string, unknown>;
      expect(ssl.ca).toEqual(TEST_CERT_FILE_CONTENT);
      expect(ssl.cipher).toEqual('TLS_AES_256_GCM_SHA384');
      expect(ssl.rejectUnauthorized).toBe(true);

      restore();
      jest.restoreAllMocks();
    });

    it('Postgres config without TLS produces no ssl in knex config', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypePostgres,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      const config = databaseConfig() as PostgresDatabaseConfig;
      const knexConfig = getKnexConfig(config);
      const connection = knexConfig.connection as Record<string, unknown>;
      expect(connection.ssl).toBeUndefined();
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

    it('when TLS min version is greater than max version', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypePostgres,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_TLS_ENABLED: 'true',
          HD_DATABASE_TLS_MIN_VERSION: 'TLSv1.3',
          HD_DATABASE_TLS_MAX_VERSION: 'TLSv1.2',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      databaseConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain(
        'TLS min version must be less than or equal to TLS max version',
      );
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });

    it('when TLS version is invalid', () => {
      const restore = mockedEnv(
        {
          /* oxlint-disable @typescript-eslint/naming-convention */
          HD_DATABASE_TYPE: databaseTypePostgres,
          HD_DATABASE_NAME: databaseName,
          HD_DATABASE_USERNAME: databaseUser,
          HD_DATABASE_PASSWORD: databasePass,
          HD_DATABASE_HOST: databaseHost,
          HD_DATABASE_TLS_ENABLED: 'true',
          HD_DATABASE_TLS_MIN_VERSION: 'TLSv1.0',
          /* oxlint-enable @typescript-eslint/naming-convention */
        },
        {
          clear: true,
        },
      );
      databaseConfig();
      expect(spyConsoleError.mock.calls[0][0]).toContain('HD_DATABASE_TLS_MIN_VERSION');
      expect(spyProcessExit).toHaveBeenCalledWith(1);
      restore();
    });
  });
});
