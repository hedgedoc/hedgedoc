/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Knex } from 'knex';

/**
 * Checks the health of the database connection using the given Knex.js query builder.
 *
 * @param knex An instance of the Knex.js query builder configured for the target database.
 * @returns A promise that resolves to `true` if the database is reachable, otherwise `false`.
 */
export async function checkDatabaseHealthWithKnex(knex: Knex): Promise<boolean> {
  try {
    await knex.raw('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks the health of the database connection using the given raw database connection.
 *
 * @param connection A raw database connection.
 * @returns A promise that resolves to `true` if the database is reachable, otherwise `false`.
 */
export async function checkDatabaseHealthWithRawConnection(connection: any): Promise<boolean> {
  try {
    await connection.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
