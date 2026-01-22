/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryBuilder } from 'knex';

export function extendKnexQueryBuilder() {
  try {
    QueryBuilder.extend('whereEqualLowercase', function (field: string, value: string) {
      return this.where(this.client.raw(`lower("${field}")`), '=', value.toLowerCase());
    });
  } catch (e) {
    console.warn("Could not extend KnexQueryBuilder with whereEqualLowercase");
  }
}
