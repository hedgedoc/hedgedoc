/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { DatabaseType } from './database-type.enum';
import { buildErrorMessage, parseOptionalNumber } from './utils';

export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  type: DatabaseType;
}

const databaseSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(DatabaseType))
    .label('HD_DATABASE_TYPE'),

  // This is the database name, except for SQLite,
  // where it is the path to the database file.
  database: Joi.string().label('HD_DATABASE_NAME'),
  username: Joi.when('type', {
    is: Joi.invalid(DatabaseType.SQLITE),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }).label('HD_DATABASE_USER'),
  password: Joi.when('type', {
    is: Joi.invalid(DatabaseType.SQLITE),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }).label('HD_DATABASE_PASS'),
  host: Joi.when('type', {
    is: Joi.invalid(DatabaseType.SQLITE),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }).label('HD_DATABASE_HOST'),
  port: Joi.when('type', {
    is: Joi.invalid(DatabaseType.SQLITE),
    then: Joi.number(),
    otherwise: Joi.optional(),
  }).label('HD_DATABASE_PORT'),
});

export default registerAs('databaseConfig', () => {
  const databaseConfig = databaseSchema.validate(
    {
      type: process.env.HD_DATABASE_TYPE,
      username: process.env.HD_DATABASE_USER,
      password: process.env.HD_DATABASE_PASS,
      database: process.env.HD_DATABASE_NAME,
      host: process.env.HD_DATABASE_HOST,
      port: parseOptionalNumber(process.env.HD_DATABASE_PORT),
    },
    {
      abortEarly: false,
      presence: 'required',
    },
  );
  if (databaseConfig.error) {
    const errorMessages = databaseConfig.error.details.map(
      (detail) => detail.message,
    );
    throw new Error(buildErrorMessage(errorMessages));
  }
  return databaseConfig.value as DatabaseConfig;
});
