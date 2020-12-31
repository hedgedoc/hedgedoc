/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as Joi from 'joi';
import { DatabaseDialect } from './database-dialect.enum';

export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  storage: string;
  dialect: DatabaseDialect;
}

export const databaseSchema = Joi.object({
  username: Joi.string(),
  password: Joi.string(),
  database: Joi.string(),
  host: Joi.string(),
  port: Joi.number(),
  storage: Joi.when('...dialect', {
    is: Joi.valid(DatabaseDialect.SQLITE),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }),
  dialect: Joi.string().valid(...Object.values(DatabaseDialect)),
});

export const appConfigDatabase = {
  username: process.env.HD_DATABASE_USER,
  password: process.env.HD_DATABASE_PASS,
  database: process.env.HD_DATABASE_NAME,
  host: process.env.HD_DATABASE_HOST,
  port: parseInt(process.env.HD_DATABASE_PORT) || undefined,
  storage: process.env.HD_DATABASE_STORAGE,
  dialect: process.env.HD_DATABASE_DIALECT,
};
