/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Knex } from 'knex';

/** This is used for the Knex CLI to create migrations during development */
const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: './hedgedoc.sqlite',
    },
    migrations: {
      directory: './src/database/migrations',
    },
  },
};

module.exports = config;
