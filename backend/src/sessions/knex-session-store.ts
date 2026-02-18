/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Session as FastifySession } from 'fastify';
import { SessionStore } from '@fastify/session';
import { Knex } from 'knex';
import { FieldNameSession, Session, TableSession } from '@hedgedoc/database';
import {dateTimeToDB, dbToDateTime, getCurrentDateTime} from '../utils/datetime'

export interface SessionStoreOptions {
  /** The time how long a session lives in seconds */
  ttl: number;

  /** The Knex instance to use for database operations */
  knex: Knex;
}

/**
 * Fastify session store implementation using Knex for database operations
 */
export class KnexSessionStore implements SessionStore {
  private readonly knex: Knex;
  private readonly ttl: number;

  constructor(options: SessionStoreOptions) {
    this.knex = options.knex;
    this.ttl = options.ttl;
  }

  /**
   * Destroy a session by its session ID
   * @param sessionId The session ID to destroy
   * @param callback Callback for fastify-session when the session has been destroyed
   */
  destroy(sessionId: string, callback: (error?: Error) => void): void {
    this.knex<Session>(TableSession)
      .where(FieldNameSession.id, sessionId)
      .delete()
      .then(() => callback())
      .catch(callback);
  }

  /**
   * Get a session by its session ID
   * @param sessionId The session ID to get the session for
   * @param callback Callback for fastify-session with the session or null if no session was found
   */
  get(
    sessionId: string,
    callback: (error: Error | null, session?: FastifySession | null) => void,
  ): void {
    const nowDbTime = dateTimeToDB(getCurrentDateTime());
    this.knex(TableSession)
      .where(FieldNameSession.id, sessionId)
      .andWhere(FieldNameSession.expiresAt, '>', nowDbTime)
      .first()
      .then((entry?: Session) => {
        const data = this.convertDatabaseEntryToSession(entry ?? null);
        callback(null, data);
      })
      .catch(callback);
  }

  /**
   * Set a session by its session ID
   * @param sessionId The session ID to set the session for
   * @param session The session to set
   * @param callback Callback for fastify-session when the session has been set
   */
  set(sessionId: string, session: FastifySession, callback: (error?: Error) => void): void {
    const dbEntry = this.convertSessionToDatabaseEntry(sessionId, session);
    this.knex<Session>(TableSession)
      .insert(dbEntry)
      .onConflict(FieldNameSession.id)
      .merge([
        FieldNameSession.userId,
        FieldNameSession.pendingUserData,
        FieldNameSession.loginAuthProviderType,
        FieldNameSession.loginAuthProviderIdentifier,
        FieldNameSession.oidcIdToken,
        FieldNameSession.oidcSid,
        FieldNameSession.oidcLoginCode,
        FieldNameSession.oidcLoginState,
        FieldNameSession.expiresAt,
        FieldNameSession.updatedAt,
        // FieldNameSession.createdAt is missing intentionally because this should not be overwritten on updates
      ])
      .then(() => callback())
      .catch(callback);
  }

  private convertDatabaseEntryToSession(dbEntry: Session | null): FastifySession | null {
    if (dbEntry === null) {
      return null;
    }
    return {
      userId: dbEntry[FieldNameSession.userId],
      csrfToken: dbEntry[FieldNameSession.csrfToken],
      pendingUser: JSON.parse(dbEntry[FieldNameSession.pendingUserData]),
      loginAuthProviderType: dbEntry[FieldNameSession.loginAuthProviderType],
      loginAuthProviderIdentifier: dbEntry[FieldNameSession.loginAuthProviderIdentifier],
      oidc: {
        idToken: dbEntry[FieldNameSession.oidcIdToken],
        sid: dbEntry[FieldNameSession.oidcSid],
        loginCode: dbEntry[FieldNameSession.oidcLoginCode],
        loginState: dbEntry[FieldNameSession.oidcLoginState],
      },
      // all cookie attributes except the expiry are static and don't need to be stored and retrieved again
      cookie: {
        originalMaxAge: null,
        expires: dbToDateTime(dbEntry[FieldNameSession.expiresAt]).toJSDate(),
        signed: true,
        secure: 'auto',
        httpOnly: true,
        sameSite: 'lax',
      },
    };
  }

  private convertSessionToDatabaseEntry(sessionId: string, session: FastifySession): Session {
    const now = getCurrentDateTime();
    const nowDbTime = dateTimeToDB(now);
    const expiry = now.plus({ seconds: this.ttl });
    const expiryDbTime = dateTimeToDB(expiry);
    return {
      // createdAt is always set to the current time in order for new sessions to work
      // for existing sessions, the Knex call ignores the createdAt field explicitly, so we can safely set it here
      [FieldNameSession.createdAt]: nowDbTime,
      [FieldNameSession.updatedAt]: nowDbTime,
      [FieldNameSession.expiresAt]: expiryDbTime,
      [FieldNameSession.id]: sessionId,
      [FieldNameSession.csrfToken]: session.csrfToken ?? null,
      [FieldNameSession.userId]: session.userId ?? null,
      [FieldNameSession.loginAuthProviderType]: session.loginAuthProviderType ?? null,
      [FieldNameSession.loginAuthProviderIdentifier]: session.loginAuthProviderIdentifier ?? null,
      [FieldNameSession.pendingUserData]: JSON.stringify(session.pendingUser ?? {}),
      [FieldNameSession.oidcIdToken]: session.oidc?.idToken ?? null,
      [FieldNameSession.oidcSid]: session.oidc?.sid ?? null,
      [FieldNameSession.oidcLoginCode]: session.oidc?.loginCode ?? null,
      [FieldNameSession.oidcLoginState]: session.oidc?.loginState ?? null,
    };
  }
}
