/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import Keyv from 'keyv';
import { Session } from 'fastify';
import { SessionStore } from '@fastify/session';
import type {} from './fastify-session.d';

export interface SessionStoreOptions {
  /** The time how long a session lives in seconds */
  ttl?: number;
}

export class KeyvSessionStore implements SessionStore {
  private readonly dataStore: Keyv<Session>;

  constructor(options?: SessionStoreOptions) {
    this.dataStore = new Keyv<Session>({
      namespace: 'sessions',
      ttl: options?.ttl ? options.ttl * 1000 : undefined,
      // TODO Add support for non-in-memory keyv backends like redis/valkey
    });
  }

  destroy(sessionId: string, callback: (error?: Error) => void): void {
    this.dataStore
      .delete(sessionId)
      .then(() => callback())
      .catch(callback);
  }

  get(sessionId: string, callback: (error: Error | null, session?: Session | null) => void): void {
    this.dataStore
      .get(sessionId)
      .then((session) => callback(null, session ?? null))
      .catch((error: Error) => callback(error));
  }

  set(sessionId: string, session: Session, callback: (error?: Error) => void): void {
    this.dataStore
      .set(sessionId, session)
      .then(() => callback())
      .catch(callback);
  }

  getAsync(sessionId: string): Promise<Session | undefined> {
    return this.dataStore.get(sessionId);
  }
}
