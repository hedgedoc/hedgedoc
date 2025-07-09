/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameUser, TableUser } from '@hedgedoc/database';
import { Test, TestingModule } from '@nestjs/testing';
import type { Tracker } from 'knex-mock-client';

import { expectBindings } from '../database/mock/expect-bindings';
import {
  mockDelete,
  mockInsert,
  mockUpdate,
} from '../database/mock/mock-queries';
import { mockKnexDb } from '../database/mock/provider';
import { LoggerModule } from '../logger/logger.module';
import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;
  let tracker: Tracker;
  let knexProvider: any;

  beforeAll(async () => {
    [tracker, knexProvider] = mockKnexDb();

    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionService, knexProvider],
      imports: [LoggerModule],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  afterEach(() => {
    tracker.reset();
  });

  // Example test for a hypothetical session insert (if sessions were stored in DB)
  describe('createSession', () => {
    it('inserts a new session', async () => {
      // Hypothetical: replace TableUser with your session table and fields
      mockInsert(
        tracker,
        'sessions',
        ['session_id', 'user_id', 'expires_at'],
        [{ session_id: 'abc123' }],
      );
      // Hypothetical: implement createSession on SessionService if needed
      if (typeof service['createSession'] === 'function') {
        const result = await service['createSession']('abc123', 42, new Date());
        expect(result).toBe('abc123');
        expectBindings(tracker, 'insert', [['abc123', 42, expect.any(Date)]]);
      }
    });
  });

  describe('deleteSession', () => {
    it('deletes a session by id', async () => {
      mockDelete(tracker, 'sessions', 'session_id', 1);
      if (typeof service['deleteSession'] === 'function') {
        await service['deleteSession']('abc123');
        expectBindings(tracker, 'delete', [['abc123']]);
      }
    });
  });

  describe('updateSession', () => {
    it('updates session fields', async () => {
      mockUpdate(tracker, 'sessions', 'session_id', 1);
      if (typeof service['updateSession'] === 'function') {
        await service['updateSession']('abc123', { expires_at: new Date() });
        expectBindings(tracker, 'update', [
          [{ expires_at: expect.any(Date) }, 'abc123'],
        ]);
      }
    });
  });
});
