/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { DatabaseDialect } from './database-dialect.enum';
import { buildErrorMessage, parseOptionalNumber } from './utils';

export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  storage: string;
  dialect: DatabaseDialect;
}

const databaseSchema = Joi.object({
  username: Joi.when('dialect', {
    is: Joi.invalid(DatabaseDialect.SQLITE),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }).label('HD_DATABASE_USER'),
  password: Joi.when('dialect', {
    is: Joi.invalid(DatabaseDialect.SQLITE),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }).label('HD_DATABASE_PASS'),
  database: Joi.when('dialect', {
    is: Joi.invalid(DatabaseDialect.SQLITE),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }).label('HD_DATABASE_NAME'),
  host: Joi.when('dialect', {
    is: Joi.invalid(DatabaseDialect.SQLITE),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }).label('HD_DATABASE_HOST'),
  port: Joi.when('dialect', {
    is: Joi.invalid(DatabaseDialect.SQLITE),
    then: Joi.number(),
    otherwise: Joi.optional(),
  }).label('HD_DATABASE_PORT'),
  storage: Joi.when('dialect', {
    is: Joi.valid(DatabaseDialect.SQLITE),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }).label('HD_DATABASE_STORAGE'),
  dialect: Joi.string()
    .valid(...Object.values(DatabaseDialect))
    .label('HD_DATABASE_DIALECT'),
});

export default registerAs('databaseConfig', () => {
  const databaseConfig = databaseSchema.validate(
    {
      username: process.env.HD_DATABASE_USER,
      password: process.env.HD_DATABASE_PASS,
      database: process.env.HD_DATABASE_NAME,
      host: process.env.HD_DATABASE_HOST,
      port: parseOptionalNumber(process.env.HD_DATABASE_PORT),
      storage: process.env.HD_DATABASE_STORAGE,
      dialect: process.env.HD_DATABASE_DIALECT,
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
