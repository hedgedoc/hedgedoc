/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Session as FastifySession } from 'fastify';
import { Knex } from 'knex';
import knex from 'knex';
import { FieldNameSession, TableSession } from '@hedgedoc/database';

import { KnexSessionStore } from './knex-session-store';

describe('KnexSessionStore', () => {
  let knexInstance: Knex;
  let store: KnexSessionStore;

  beforeAll(async () => {
    knexInstance = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    });

    // Create the session table
    await knexInstance.schema.createTable(TableSession, (table) => {
      table.string(FieldNameSession.id).primary();
      table.integer(FieldNameSession.userId).unsigned().nullable();
      table.text(FieldNameSession.data).notNullable();
      table.string(FieldNameSession.sid).nullable();
      table.timestamp(FieldNameSession.createdAt, { useTz: false, precision: 3 }).notNullable();
      table.timestamp(FieldNameSession.updatedAt, { useTz: false, precision: 3 }).notNullable();
      table.timestamp(FieldNameSession.expiresAt, { useTz: false, precision: 3 }).notNullable();
      table.index([FieldNameSession.userId], 'idx_session_user_id');
      table.index([FieldNameSession.sid], 'idx_session_sid');
      table.index([FieldNameSession.expiresAt], 'idx_session_expires_at');
    });

    store = new KnexSessionStore({
      ttl: 3600,
      knex: knexInstance,
    });
  });

  afterAll(async () => {
    await knexInstance.destroy();
  });

  afterEach(async () => {
    await knexInstance(TableSession).delete();
  });

  describe('set and get', () => {
    it('should store and retrieve a session', (done) => {
      const sessionId = 'test-session-id';
      const session: FastifySession = {
        cookie: {
          originalMaxAge: null,
        },
        userId: 123,
      };

      store.set(sessionId, session, (error) => {
        expect(error).toBeUndefined();

        store.get(sessionId, (getError, retrievedSession) => {
          expect(getError).toBeNull();
          expect(retrievedSession).toBeDefined();
          expect(retrievedSession?.userId).toBe(123);
          done();
        });
      });
    });

    it('should return null for non-existent session', (done) => {
      store.get('non-existent', (error, session) => {
        expect(error).toBeNull();
        expect(session).toBeNull();
        done();
      });
    });

    it('should update an existing session', (done) => {
      const sessionId = 'test-session-id';
      const session1: FastifySession = {
        cookie: {
          originalMaxAge: null,
        },
        userId: 123,
      };

      store.set(sessionId, session1, (error) => {
        expect(error).toBeUndefined();

        const session2: FastifySession = {
          cookie: {
            originalMaxAge: null,
          },
          userId: 456,
        };

        store.set(sessionId, session2, (updateError) => {
          expect(updateError).toBeUndefined();

          store.get(sessionId, (getError, retrievedSession) => {
            expect(getError).toBeNull();
            expect(retrievedSession?.userId).toBe(456);
            done();
          });
        });
      });
    });
  });

  describe('destroy', () => {
    it('should delete a session', (done) => {
      const sessionId = 'test-session-id';
      const session: FastifySession = {
        cookie: {
          originalMaxAge: null,
        },
        userId: 123,
      };

      store.set(sessionId, session, (error) => {
        expect(error).toBeUndefined();

        store.destroy(sessionId, (destroyError) => {
          expect(destroyError).toBeUndefined();

          store.get(sessionId, (getError, retrievedSession) => {
            expect(getError).toBeNull();
            expect(retrievedSession).toBeNull();
            done();
          });
        });
      });
    });
  });

  describe('findSessionIdBySid', () => {
    it('should find session by OIDC sid', async () => {
      const sessionId = 'test-session-id';
      const oidcSid = 'oidc-session-id';
      const session: FastifySession = {
        cookie: {
          originalMaxAge: null,
        },
        userId: 123,
        oidc: {
          sid: oidcSid,
        },
      };

      await new Promise<void>((resolve) => {
        store.set(sessionId, session, () => resolve());
      });

      const foundSessionId = await store.findSessionIdBySid(oidcSid);
      expect(foundSessionId).toBe(sessionId);
    });

    it('should return undefined for non-existent sid', async () => {
      const foundSessionId = await store.findSessionIdBySid('non-existent-sid');
      expect(foundSessionId).toBeUndefined();
    });
  });

  describe('findSessionIdsByUserId', () => {
    it('should find all sessions for a user', async () => {
      const userId = 123;
      const session1: FastifySession = {
        cookie: {
          originalMaxAge: null,
        },
        userId,
      };
      const session2: FastifySession = {
        cookie: {
          originalMaxAge: null,
        },
        userId,
      };

      await new Promise<void>((resolve) => {
        store.set('session-1', session1, () => {
          store.set('session-2', session2, () => resolve());
        });
      });

      const sessionIds = await store.findSessionIdsByUserId(userId);
      expect(sessionIds).toHaveLength(2);
      expect(sessionIds).toContain('session-1');
      expect(sessionIds).toContain('session-2');
    });

    it('should return empty array for user with no sessions', async () => {
      const sessionIds = await store.findSessionIdsByUserId(999);
      expect(sessionIds).toHaveLength(0);
    });
  });

  describe('destroyMultiple', () => {
    it('should delete multiple sessions', async () => {
      const session: FastifySession = {
        cookie: {
          originalMaxAge: null,
        },
        userId: 123,
      };

      await new Promise<void>((resolve) => {
        store.set('session-1', session, () => {
          store.set('session-2', session, () => {
            store.set('session-3', session, () => resolve());
          });
        });
      });

      await store.destroyMultiple(['session-1', 'session-2']);

      const session1 = await store.getAsync('session-1');
      const session2 = await store.getAsync('session-2');
      const session3 = await store.getAsync('session-3');

      expect(session1).toBeUndefined();
      expect(session2).toBeUndefined();
      expect(session3).toBeDefined();
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should remove expired sessions', async () => {
      const expiredStore = new KnexSessionStore({
        ttl: -1, // Sessions expire immediately
        knex: knexInstance,
      });

      const session: FastifySession = {
        cookie: {
          originalMaxAge: null,
        },
        userId: 123,
      };

      await new Promise<void>((resolve) => {
        expiredStore.set('expired-session', session, () => resolve());
      });

      // Wait a bit to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      const deletedCount = await store.cleanupExpiredSessions();
      expect(deletedCount).toBeGreaterThan(0);

      const retrievedSession = await store.getAsync('expired-session');
      expect(retrievedSession).toBeUndefined();
    });
  });
});
