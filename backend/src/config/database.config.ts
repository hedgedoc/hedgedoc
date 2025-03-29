/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import z from 'zod';

import { DatabaseType } from './database-type.enum';
import { parseOptionalNumber } from './utils';
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

const mysqlDbSchema = z.object({
  type: z.literal(DatabaseType.MYSQL).describe('HD_DATABASE_TYPE'),
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
  mysqlDbSchema,
  postgresDbSchema,
]);

export type SqliteDatabaseConfig = z.infer<typeof sqliteDbSchema>;
export type PostgresDatabaseConfig = z.infer<typeof postgresDbSchema>;
export type MariadbDatabaseConfig = z.infer<typeof mariaDbSchema>;
export type MySQLDatabaseConfig = z.infer<typeof mysqlDbSchema>;
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
    throw new Error(buildErrorMessage(errorMessages));
  }
  return databaseConfig.data;
});
