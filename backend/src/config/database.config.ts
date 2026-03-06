/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import { Knex } from 'knex';
import { types as pgTypes } from 'pg';
import { ConnectionOptions } from 'tls';
import z from 'zod';

import { DatabaseType } from './database-type.enum';
import {
  parseOptionalBoolean,
  parseOptionalNumber,
  printConfigErrorAndExit,
  readOptionalFileContents,
} from './utils';
import { buildErrorMessage, extractDescriptionFromZodIssue } from './zod-error-message';
import { checkDatabaseHealthWithRawConnection } from '../database/utils/healthcheck';

// Knex.js ships with incomplete TypeScript types regarding the validate option
// for connection pools. Therefore we need to manually define them here.
// We use a connection pool to ensure reconnection to the database when the
// connection was lost in between.
interface KnexPoolConfigWithValidate extends Knex.PoolConfig {
  validate?: (resource: { query: (sql: string) => Promise<unknown> }) => boolean | Promise<boolean>;
}
interface KnexConfigWithPoolConfig extends Knex.Config {
  pool?: KnexPoolConfigWithValidate;
}

const tlsVersionEnum = z.enum(['TLSv1.2', 'TLSv1.3']);

const dbTlsSchema = z
  .object({
    enabled: z.boolean().default(false).describe('HD_DATABASE_TLS_ENABLED'),
    caPath: z.string().optional().describe('HD_DATABASE_TLS_CA_PATH'),
    certPath: z.string().optional().describe('HD_DATABASE_TLS_CERT_PATH'),
    keyPath: z.string().optional().describe('HD_DATABASE_TLS_KEY_PATH'),
    rejectUnauthorized: z.boolean().default(true).describe('HD_DATABASE_TLS_REJECT_UNAUTHORIZED'),
    ciphers: z.string().optional().describe('HD_DATABASE_TLS_CIPHERS'),
    minVersion: tlsVersionEnum.optional().describe('HD_DATABASE_TLS_MIN_VERSION'),
    maxVersion: tlsVersionEnum.optional().describe('HD_DATABASE_TLS_MAX_VERSION'),
    passphrase: z.string().optional().describe('HD_DATABASE_TLS_PASSPHRASE'),
  })
  .superRefine((config, ctx) => {
    if (config.minVersion && config.maxVersion && config.minVersion > config.maxVersion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'TLS min version must be less than or equal to TLS max version',
        path: ['minVersion'],
        fatal: true,
      });
    }
  });

const sqliteDbSchema = z.object({
  type: z.literal(DatabaseType.SQLITE).describe('HD_DATABASE_TYPE'),
  name: z.string().describe('HD_DATABASE_NAME'),
});

const postgresDbSchema = z.object({
  type: z.literal(DatabaseType.POSTGRES).describe('HD_DATABASE_TYPE'),
  name: z.string().describe('HD_DATABASE_NAME'),
  username: z.string().describe('HD_DATABASE_USERNAME'),
  password: z.string().describe('HD_DATABASE_PASSWORD'),
  host: z.string().describe('HD_DATABASE_HOST'),
  port: z.number().positive().max(65535).default(5432).describe('HD_DATABASE_PORT'),
  tls: dbTlsSchema.default({}),
});

const mariaDbSchema = z.object({
  type: z.literal(DatabaseType.MARIADB).describe('HD_DATABASE_TYPE'),
  name: z.string().describe('HD_DATABASE_NAME'),
  username: z.string().describe('HD_DATABASE_USERNAME'),
  password: z.string().describe('HD_DATABASE_PASSWORD'),
  host: z.string().describe('HD_DATABASE_HOST'),
  port: z.number().positive().max(65535).default(3306).describe('HD_DATABASE_PORT'),
  tls: dbTlsSchema.default({}),
});

const dbSchema = z.discriminatedUnion('type', [sqliteDbSchema, mariaDbSchema, postgresDbSchema]);

export type DatabaseTlsConfig = z.infer<typeof dbTlsSchema>;
export type SqliteDatabaseConfig = z.infer<typeof sqliteDbSchema>;
export type PostgresDatabaseConfig = z.infer<typeof postgresDbSchema>;
export type MariadbDatabaseConfig = z.infer<typeof mariaDbSchema>;
export type DatabaseConfig = z.infer<typeof dbSchema>;

export default registerAs('databaseConfig', () => {
  const databaseConfig = dbSchema.safeParse({
    type: process.env.HD_DATABASE_TYPE,
    username: process.env.HD_DATABASE_USERNAME,
    password: process.env.HD_DATABASE_PASSWORD,
    name: process.env.HD_DATABASE_NAME,
    host: process.env.HD_DATABASE_HOST,
    port: parseOptionalNumber(process.env.HD_DATABASE_PORT),
    tls: {
      enabled: parseOptionalBoolean(process.env.HD_DATABASE_TLS_ENABLED),
      caPath: process.env.HD_DATABASE_TLS_CA_PATH,
      certPath: process.env.HD_DATABASE_TLS_CERT_PATH,
      keyPath: process.env.HD_DATABASE_TLS_KEY_PATH,
      rejectUnauthorized: parseOptionalBoolean(process.env.HD_DATABASE_TLS_REJECT_UNAUTHORIZED),
      ciphers: process.env.HD_DATABASE_TLS_CIPHERS,
      minVersion: process.env.HD_DATABASE_TLS_MIN_VERSION,
      maxVersion: process.env.HD_DATABASE_TLS_MAX_VERSION,
      passphrase: process.env.HD_DATABASE_TLS_PASSPHRASE,
    },
  });
  if (databaseConfig.error) {
    const errorMessages = databaseConfig.error.errors.map((issue) =>
      extractDescriptionFromZodIssue(issue, 'HD_DATABASE'),
    );
    const errorMessage = buildErrorMessage(errorMessages);
    return printConfigErrorAndExit(errorMessage);
  }
  return databaseConfig.data;
});

/**
 * Builds the TLS connection options for PostgreSQL from the TLS config.
 *
 * @param tlsConfig The TLS configuration
 * @returns The TLS connection options or undefined if TLS is not enabled
 */
function buildPostgresTlsOptions(tlsConfig: DatabaseTlsConfig): ConnectionOptions | undefined {
  if (!tlsConfig.enabled) {
    return undefined;
  }
  return {
    ca: readOptionalFileContents(tlsConfig.caPath),
    cert: readOptionalFileContents(tlsConfig.certPath),
    key: readOptionalFileContents(tlsConfig.keyPath),
    rejectUnauthorized: tlsConfig.rejectUnauthorized,
    ciphers: tlsConfig.ciphers,
    minVersion: tlsConfig.minVersion,
    maxVersion: tlsConfig.maxVersion,
    passphrase: tlsConfig.passphrase,
  };
}

/**
 * Builds the TLS connection options for MariaDB from the TLS config.
 *
 * @param tlsConfig The TLS configuration
 * @returns The MariaDB TLS configuration object or undefined if TLS is not enabled
 */
function buildMariaDbTlsOptions(
  tlsConfig: DatabaseTlsConfig,
):
  | { ca?: string; cert?: string; key?: string; rejectUnauthorized: boolean; cipher?: string }
  | undefined {
  if (!tlsConfig.enabled) {
    return undefined;
  }
  return {
    ca: readOptionalFileContents(tlsConfig.caPath),
    cert: readOptionalFileContents(tlsConfig.certPath),
    key: readOptionalFileContents(tlsConfig.keyPath),
    rejectUnauthorized: tlsConfig.rejectUnauthorized,
    cipher: tlsConfig.ciphers,
  };
}

export function getKnexConfig(databaseConfig: DatabaseConfig): Knex.Config {
  switch (databaseConfig.type) {
    case DatabaseType.SQLITE:
      return {
        client: 'better-sqlite3',
        connection: {
          filename: databaseConfig.name,
        },
        useNullAsDefault: true,
      };
    case DatabaseType.POSTGRES:
      // If we don't set the type parsers for TIMESTAMP and TIMESTAMPTZ, pg would return JSDate objects here
      // This is not what we want, so we set them to the string representation of the timestamp
      pgTypes.setTypeParser(pgTypes.builtins.TIMESTAMP, (value: string) => value);
      pgTypes.setTypeParser(pgTypes.builtins.TIMESTAMPTZ, (value: string) => value);
      return {
        client: 'pg',
        connection: {
          host: databaseConfig.host,
          port: databaseConfig.port,
          user: databaseConfig.username,
          database: databaseConfig.name,
          password: databaseConfig.password,
          // oxlint-disable-next-line @typescript-eslint/naming-convention
          application_name: 'HedgeDoc',
          ssl: buildPostgresTlsOptions(databaseConfig.tls),
        },
        pool: {
          min: 0,
          max: 10,
          acquireTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
          validate: checkDatabaseHealthWithRawConnection,
        },
      } as KnexConfigWithPoolConfig;
    case DatabaseType.MARIADB:
      return {
        client: 'mysql2',
        connection: {
          host: databaseConfig.host,
          port: databaseConfig.port,
          user: databaseConfig.username,
          database: databaseConfig.name,
          password: databaseConfig.password,
          dateStrings: true,
          charset: 'utf8mb4',
          ssl: buildMariaDbTlsOptions(databaseConfig.tls),
        },
        pool: {
          min: 0,
          max: 10,
          acquireTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
          validate: checkDatabaseHealthWithRawConnection,
        },
      } as KnexConfigWithPoolConfig;
  }
}
