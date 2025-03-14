/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createHash } from 'crypto';
import { Knex } from 'knex';

import { FieldNameApiToken, TableApiToken } from '../types';

export async function seed(knex: Knex): Promise<void> {
  // Clear table beforehand
  await knex(TableApiToken).del();

  // Insert an api token
  const apiToken =
    'LaD52wgw7pi5zVitv4gR5lxoUa6ncTQGASPmXDSdppB9xcd9kCtqjlrdQ8OOfmG9DNXGvfkIwaOCAv8nRp8IoQ';
  await knex(TableApiToken).insert({
    [FieldNameApiToken.id]: 'pA4mOf51bpY',
    [FieldNameApiToken.userId]: 2,
    [FieldNameApiToken.label]: 'Local Test User API Token',
    [FieldNameApiToken.secretHash]: createHash('sha512')
      .update(apiToken)
      .digest('hex'),
    // Token is valid for 2 years
    [FieldNameApiToken.validUntil]: new Date(
      new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000,
    ),
    [FieldNameApiToken.createdAt]: new Date(),
  });
}
