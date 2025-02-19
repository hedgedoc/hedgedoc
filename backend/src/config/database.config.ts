/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { registerAs } from '@nestjs/config';
import * as fs from 'fs';
import * as Joi from 'joi';

import { DatabaseType } from './database-type.enum';
import { buildErrorMessage, parseOptionalNumber } from './utils';

interface SSLConfig {
  ca: string;
  key: string;
  cert: string;
  rejectUnauthorized: boolean;
  ciphers: string;
  maxVersion: string;
  minVersion: string;
  passphrase: string;
}
export interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  type: DatabaseType;
  ssl?: SSLConfig;
}

const getSecret = (path?: string) => {
  if (path && fs.existsSync(path)) {
    return fs.readFileSync(path, 'utf8');
  }
};

const sqlTlsSchema = Joi.object({
  rejectUnauthorized: Joi.boolean()
    .default(true)
    .label('HD_DATABASE_SSL_REJECT_UNAUTHORIZED')
    .optional(),
  ca: Joi.string().label('HD_DATABASE_SSL_CA_PATH'),
  cert: Joi.string().label('HD_DATABASE_SSL_CERT_PATH').optional(),
  key: Joi.string().label('HD_DATABASE_SSL_KEY_PATH').optional(),
  ciphers: Joi.string().label('HD_DATABASE_SSL_CIPHERS').optional(),
  maxVersion: Joi.string().label('HD_DATABASE_SSL_MAX_VERSION').optional(),
  minVersion: Joi.string().label('HD_DATABASE_SSL_MIN_VERSION').optional(),
  passphrase: Joi.string().label('HD_DATABASE_SSL_PASSPHRASE').optional(),
});

const databaseSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(DatabaseType))
    .label('HD_DATABASE_TYPE'),
  needsSSL: Joi.boolean().label('HD_DATABASE_SSL'),

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
  ssl: Joi.when('needsSSL', {
    is: Joi.valid('1'),
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).when('type', {
    is: Joi.valid(
      DatabaseType.MARIADB,
      DatabaseType.MYSQL,
      DatabaseType.SQLITE,
    ),
    then: sqlTlsSchema,
    otherwise: Joi.optional(),
  }),
});

const getTlsConfig = (dbType: DatabaseType, needsSSL: boolean) => {
  if (!needsSSL) {
    return;
  }

  const sqlTlsConfig = [DatabaseType.MARIADB, DatabaseType.MYSQL].includes(
    dbType,
  ) && {
    ssl: {
      ca: getSecret(process.env.HD_DATABASE_SSL_CA_PATH),
      key: getSecret(process.env.HD_DATABASE_SSL_KEY_PATH),
      cert: getSecret(process.env.HD_DATABASE_SSL_CERT_PATH),
      rejectUnauthorized:
        process.env.HD_DATABASE_SSL_REJECT_UNAUTHORIZED === 'true',
      ciphers: process.env.HD_DATABASE_SSL_CIPHERS,
      maxVersion: process.env.HD_DATABASE_SSL_MAX_VERSION,
      minVersion: process.env.HD_DATABASE_SSL_MIN_VERSION,
      passphrase: process.env.HD_DATABASE_SSL_PASSPHRASE,
    },
  };

  return sqlTlsConfig;
};

const dbType = process.env.HD_DATABASE_TYPE;

const needsSSL = process.env.HD_DATABASE_SSL_ENABLED === 'true';
const tlsConfig = getTlsConfig(dbType as DatabaseType, needsSSL);

export default registerAs('databaseConfig', () => {
  const databaseConfig = databaseSchema.validate(
    {
      needsSSL,
      type: process.env.HD_DATABASE_TYPE,
      username: process.env.HD_DATABASE_USER,
      password: process.env.HD_DATABASE_PASS,
      database: process.env.HD_DATABASE_NAME,
      host: process.env.HD_DATABASE_HOST,
      port: parseOptionalNumber(process.env.HD_DATABASE_PORT),
      ...tlsConfig,
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
