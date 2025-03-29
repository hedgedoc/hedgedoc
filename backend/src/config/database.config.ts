/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import z from 'zod';

import { DatabaseType } from './database-type.enum';
import {
  buildErrorMessage,
  extractDescriptionFromZodSchema,
  parseOptionalNumber,
} from './utils';

const sqliteDbSchema = z.object({
  type: z.literal(DatabaseType.SQLITE).describe('HD_DATABASE_TYPE'),
  database: z.string().describe('HD_DATABASE_NAME'),
});

const otherDbSchema = z.object({
  type: z
    .literal(DatabaseType.MARIADB)
    .or(z.literal(DatabaseType.MYSQL))
    .or(z.literal(DatabaseType.POSTGRES))
    .describe('HD_DATABASE_TYPE'),
  database: z.string().describe('HD_DATABASE_NAME'),
  username: z.string().describe('HD_DATABASE_USER'),
  password: z.string().describe('HD_DATABASE_PASS'),
  host: z.string().describe('HD_DATABASE_HOST'),
  port: z.number().positive().max(65535).describe('HD_DATABASE_PORT'),
});

const dbSchema = z.discriminatedUnion('type', [sqliteDbSchema, otherDbSchema]);

export type DatabaseConfig = z.infer<typeof dbSchema>;

export default registerAs('databaseConfig', () => {
  const databaseConfig = dbSchema.safeParse({
    type: process.env.HD_DATABASE_TYPE,
    username: process.env.HD_DATABASE_USER,
    password: process.env.HD_DATABASE_PASS,
    database: process.env.HD_DATABASE_NAME,
    host: process.env.HD_DATABASE_HOST,
    port: parseOptionalNumber(process.env.HD_DATABASE_PORT),
  });
  if (databaseConfig.error) {
    const errorMessages = databaseConfig.error.errors.map((issue) =>
      extractDescriptionFromZodSchema(dbSchema, issue),
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return databaseConfig.data;
});
