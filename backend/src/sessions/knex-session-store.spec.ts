/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameSession, Session, TableSession } from '@hedgedoc/database';
import { Session as FastifySession } from 'fastify';
import knex, { Knex } from 'knex';
import { createTracker, MockClient, Tracker } from 'knex-mock-client';

import { expectBindings } from '../database/mock/expect-bindings';
import { mockDelete, mockInsert, mockSelect } from '../database/mock/mock-queries';
import { dateTimeToDB, dbToDateTime, isoStringToDateTime } from '../utils/datetime';
import { KnexSessionStore } from './knex-session-store';

const mockNowIso = '2026-03-04T12:00:00.000Z';
const mockNowDb = dateTimeToDB(isoStringToDateTime(mockNowIso));
const ttl = 3600;
const mockExpiryDb = dateTimeToDB(isoStringToDateTime(mockNowIso).plus({ seconds: ttl }));

const insertColumns = [
  FieldNameSession.createdAt,
  FieldNameSession.csrfToken,
  FieldNameSession.expiresAt,
  FieldNameSession.id,
  FieldNameSession.loginAuthProviderIdentifier,
  FieldNameSession.loginAuthProviderType,
  FieldNameSession.oidcIdToken,
  FieldNameSession.oidcLoginCode,
  FieldNameSession.oidcLoginState,
  FieldNameSession.oidcSid,
  FieldNameSession.pendingUserData,
  FieldNameSession.updatedAt,
  FieldNameSession.userId,
];

describe('KnexSessionStore', () => {
  let db: Knex;
  let tracker: Tracker;
  let store: KnexSessionStore;

  beforeAll(() => {
    db = knex({ client: MockClient, dialect: 'pg' });
    tracker = createTracker(db);
    store = new KnexSessionStore({ ttl, knex: db });
  });

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(mockNowIso));
  });

  afterEach(() => {
    tracker.reset();
    jest.useRealTimers();
  });

  describe('destroy', () => {
    it('issues a DELETE for the given session ID', (done) => {
      mockDelete(tracker, TableSession, [FieldNameSession.id], 1);
      store.destroy('session-1', (error) => {
        expect(error).toBeUndefined();
        expectBindings(tracker, 'delete', [['session-1']]);
        done();
      });
    });
  });

  describe('get', () => {
    it('returns null when no matching session exists', (done) => {
      mockSelect(
        tracker,
        [],
        TableSession,
        [FieldNameSession.id, FieldNameSession.expiresAt],
        undefined,
      );
      store.get('session-1', (error, session) => {
        expect(error).toBeNull();
        expect(session).toBeNull();
        expectBindings(tracker, 'select', [['session-1', mockNowDb]], true);
        done();
      });
    });

    it('maps all database columns to the correct session fields', (done) => {
      mockSelect(
        tracker,
        [],
        TableSession,
        [FieldNameSession.id, FieldNameSession.expiresAt],
        [
          {
            [FieldNameSession.id]: 'session-1',
            [FieldNameSession.userId]: 42,
            [FieldNameSession.csrfToken]: 'my-csrf',
            [FieldNameSession.loginAuthProviderType]: AuthProviderType.LOCAL,
            [FieldNameSession.loginAuthProviderIdentifier]: 'local',
            [FieldNameSession.oidcIdToken]: 'id-tok',
            [FieldNameSession.oidcSid]: 'oidc-sid',
            [FieldNameSession.oidcLoginCode]: 'oidc-code',
            [FieldNameSession.oidcLoginState]: 'oidc-state',
            [FieldNameSession.pendingUserData]: JSON.stringify({ providerUserId: 'prov-1' }),
            [FieldNameSession.createdAt]: mockNowDb,
            [FieldNameSession.updatedAt]: mockNowDb,
            [FieldNameSession.expiresAt]: mockExpiryDb,
          } as Session,
        ],
      );
      store.get('session-1', (error, session) => {
        expect(error).toBeNull();
        expect(session).not.toBeNull();
        expect(session?.userId).toBe(42);
        expect(session?.csrfToken).toBe('my-csrf');
        expect(session?.loginAuthProviderType).toBe(AuthProviderType.LOCAL);
        expect(session?.loginAuthProviderIdentifier).toBe('local');
        expect(session?.oidc.idToken).toBe('id-tok');
        expect(session?.oidc.sid).toBe('oidc-sid');
        expect(session?.oidc.loginCode).toBe('oidc-code');
        expect(session?.oidc.loginState).toBe('oidc-state');
        expect(session?.pendingUser).toEqual({ providerUserId: 'prov-1' });
        expect(session?.cookie?.expires).toEqual(dbToDateTime(mockExpiryDb).toJSDate());
        expect(session?.cookie?.signed).toBe(true);
        expect(session?.cookie?.secure).toBe('auto');
        expect(session?.cookie?.httpOnly).toBe(true);
        expect(session?.cookie?.sameSite).toBe('lax');
        expect(session?.cookie?.originalMaxAge).toBeNull();
        expectBindings(tracker, 'select', [['session-1', mockNowDb]], true);
        done();
      });
    });
  });

  describe('set', () => {
    it('inserts a session where all optional fields are null', (done) => {
      mockInsert(tracker, TableSession, insertColumns);
      const session = {
        cookie: { originalMaxAge: null },
        csrfToken: null,
        userId: null,
        loginAuthProviderType: null,
        loginAuthProviderIdentifier: null,
        oidc: { idToken: null, sid: null, loginCode: null, loginState: null },
        pendingUser: null,
      } as FastifySession;
      store.set('session-1', session, (error) => {
        expect(error).toBeUndefined();
        expectBindings(tracker, 'insert', [
          [
            mockNowDb,
            null,
            mockExpiryDb,
            'session-1',
            null,
            null,
            null,
            null,
            null,
            null,
            '{}',
            mockNowDb,
            null,
          ],
        ]);
        done();
      });
    });

    it('inserts a fully-populated session with auth provider and OIDC data', (done) => {
      mockInsert(tracker, TableSession, insertColumns);
      const pendingUser = { providerUserId: 'prov-1' };
      const session = {
        cookie: { originalMaxAge: null },
        csrfToken: 'my-csrf',
        userId: 42,
        loginAuthProviderType: AuthProviderType.OIDC,
        loginAuthProviderIdentifier: 'oidc-provider',
        oidc: {
          idToken: 'id-tok',
          sid: 'oidc-sid',
          loginCode: 'oidc-code',
          loginState: 'oidc-state',
        },
        pendingUser,
      } as FastifySession;
      store.set('session-1', session, (error) => {
        expect(error).toBeUndefined();
        expectBindings(tracker, 'insert', [
          [
            mockNowDb,
            'my-csrf',
            mockExpiryDb,
            'session-1',
            'oidc-provider',
            AuthProviderType.OIDC,
            'id-tok',
            'oidc-code',
            'oidc-state',
            'oidc-sid',
            JSON.stringify(pendingUser),
            mockNowDb,
            42,
          ],
        ]);
        done();
      });
    });
  });
});
