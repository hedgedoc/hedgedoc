/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Provider } from '@nestjs/common';
import knex from 'knex';
import { createTracker, MockClient, Tracker } from 'knex-mock-client';

export function mockKnexDb(): [Tracker, Provider] {
  const db = knex({ client: MockClient, dialect: 'pg' });
  const tracker = createTracker(db);
  const provider = {
    provide: 'default',
    useValue: db,
  };
  return [tracker, provider];
}
