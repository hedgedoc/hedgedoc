/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Provider } from '@nestjs/common';
import knex from 'knex';
import { createTracker, MockClient, Tracker } from 'knex-mock-client';
import { extendKnexQueryBuilder } from '../extend-knex-query-builder';

/**
 * Creates a mock Knex database instance and its tracker for testing purposes.
 *
 * @returns A tuple containing the tracker and the NestJS provider for the mock database.
 */
export function mockKnexDb(): [Tracker, Provider] {
  const db = knex({ client: MockClient, dialect: 'pg' });
  extendKnexQueryBuilder();
  const tracker = createTracker(db);
  const provider = {
    provide: 'default',
    useValue: db,
  };
  return [tracker, provider];
}
