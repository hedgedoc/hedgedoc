/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import { Knex } from 'knex';
import { types as pgTypes } from 'pg';
import z from 'zod';

import { DatabaseType } from './database-type.enum';
import { parseOptionalNumber, printConfigErrorAndExit } from './utils';
import {
  buildErrorMessage,
  extractDescriptionFromZodIssue,
} from './zod-error-message';

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
  port: z
    .number()
    .positive()
    .max(65535)
    .default(5432)
    .describe('HD_DATABASE_PORT'),
});

const mariaDbSchema = z.object({
  type: z.literal(DatabaseType.MARIADB).describe('HD_DATABASE_TYPE'),
  name: z.string().describe('HD_DATABASE_NAME'),
  username: z.string().describe('HD_DATABASE_USERNAME'),
  password: z.string().describe('HD_DATABASE_PASSWORD'),
  host: z.string().describe('HD_DATABASE_HOST'),
  port: z
    .number()
    .positive()
    .max(65535)
    .default(3306)
    .describe('HD_DATABASE_PORT'),
});

const dbSchema = z.discriminatedUnion('type', [
  sqliteDbSchema,
  mariaDbSchema,
  postgresDbSchema,
]);

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
      pgTypes.setTypeParser(
        pgTypes.builtins.TIMESTAMP,
        (value: string) => value,
      );
      pgTypes.setTypeParser(
        pgTypes.builtins.TIMESTAMPTZ,
        (value: string) => value,
      );
      return {
        client: 'pg',
        connection: {
          host: databaseConfig.host,
          port: databaseConfig.port,
          user: databaseConfig.username,
          database: databaseConfig.name,
          password: databaseConfig.password,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          application_name: 'HedgeDoc',
        },
      };
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
        },
      };
  }
}
