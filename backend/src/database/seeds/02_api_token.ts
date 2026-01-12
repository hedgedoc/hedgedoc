/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameApiToken, TableApiToken } from '@hedgedoc/database';
import { createHash } from 'crypto';
import { Knex } from 'knex';

import { dateTimeToDB, dateTimeToISOString, getCurrentDateTime } from '../../utils/datetime';

export async function seed(knex: Knex): Promise<void> {
  // Clear table beforehand
  await knex(TableApiToken).del();

  const validUntil = dateTimeToISOString(getCurrentDateTime().plus({ year: 1 }));

  // Insert an api token
  const apiToken =
    'LaD52wgw7pi5zVitv4gR5lxoUa6ncTQGASPmXDSdppB9xcd9kCtqjlrdQ8OOfmG9DNXGvfkIwaOCAv8nRp8IoQ';
  await knex(TableApiToken).insert({
    [FieldNameApiToken.id]: 'pA4mOf51bpY',
    [FieldNameApiToken.userId]: 2,
    [FieldNameApiToken.label]: 'Local Test User API Token',
    [FieldNameApiToken.secretHash]: createHash('sha512').update(apiToken).digest('hex'),
    [FieldNameApiToken.validUntil]: validUntil,
    [FieldNameApiToken.createdAt]: dateTimeToDB(getCurrentDateTime()),
    [FieldNameApiToken.lastUsedAt]: null,
  });
}
