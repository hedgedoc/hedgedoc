/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SessionData, Store } from 'express-session';
import Keyv from 'keyv';

export interface SessionStoreOptions {
  /** The time how long a session lives in seconds */
  ttl?: number;
}

export class KeyvSessionStore<T extends SessionData> extends Store {
  private readonly dataStore: Keyv<T>;

  constructor(options?: SessionStoreOptions) {
    super();
    this.dataStore = new Keyv<T>({
      namespace: 'sessions',
      ttl: options?.ttl,
      // TODO Add support for non-in-memory keyv backends like redis/valkey
    });
  }

  destroy(sid: string, callback: (error?: Error) => void): void {
    this.dataStore
      .delete(sid)
      .then(() => callback())
      .catch(callback);
  }

  clear(callback: (error?: Error) => void): void {
    this.dataStore
      .clear()
      .then(() => {
        callback(undefined);
      })
      .catch(callback);
  }

  get(sid: string, callback: (error?: Error, session?: T) => void): void {
    this.dataStore
      .get(sid)
      .then((session) => callback(undefined, session))
      .catch((error: Error) => callback(error));
  }

  set(sid: string, session: T, callback: (error?: Error) => void): void {
    this.dataStore
      .set(sid, session)
      .then(() => callback())
      .catch(callback);
  }

  touch(sid: string, session: T, callback: (error?: Error) => void): void {
    // Keyv does not allow updating the TTL of an existing entry, so we just set it again
    this.set(sid, session, callback);
  }

  getAsync(sid: string): Promise<T | undefined> {
    return this.dataStore.get(sid);
  }
}
