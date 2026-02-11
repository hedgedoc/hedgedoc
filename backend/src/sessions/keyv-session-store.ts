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
  private readonly sessionIdIndex: Map<string, string> = new Map(); // sid -> sessionId
  private readonly userIdIndex: Map<number, Set<string>> = new Map(); // userId -> Set<sessionId>

  constructor(options?: SessionStoreOptions) {
    this.dataStore = new Keyv<Session>({
      namespace: 'sessions',
      ttl: options?.ttl ? options.ttl * 1000 : undefined,
      // TODO Add support for non-in-memory keyv backends like redis/valkey
    });
  }

  destroy(sessionId: string, callback: (error?: Error) => void): void {
    this.getAsync(sessionId)
      .then((session) => {
        this.removeFromIndexes(sessionId, session);
        return this.dataStore.delete(sessionId);
      })
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
      .then(() => {
        this.updateIndexes(sessionId, session);
        callback();
      })
      .catch(callback);
  }

  getAsync(sessionId: string): Promise<Session | undefined> {
    return this.dataStore.get(sessionId);
  }

  /**
   * Find session ID by OIDC session ID (sid)
   *
   * @param sid The OIDC session ID
   * @returns The session ID if found, undefined otherwise
   */
  findSessionIdBySid(sid: string): string | undefined {
    return this.sessionIdIndex.get(sid);
  }

  /**
   * Find all session IDs for a given user
   *
   * @param userId The user ID
   * @returns Array of session IDs for the user
   */
  findSessionIdsByUserId(userId: number): string[] {
    return Array.from(this.userIdIndex.get(userId) ?? []);
  }

  /**
   * Destroy multiple sessions by their IDs
   *
   * @param sessionIds Array of session IDs to destroy
   * @returns Promise that resolves when all sessions are destroyed
   */
  async destroyMultiple(sessionIds: string[]): Promise<void> {
    await Promise.all(
      sessionIds.map(
        (sessionId) =>
          new Promise<void>((resolve, reject) => {
            this.destroy(sessionId, (error) => {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          }),
      ),
    );
  }

  /**
   * Update internal indexes when a session is set
   */
  private updateIndexes(sessionId: string, session: Session): void {
    // Update sid index
    const sid = session.oidc?.sid;
    if (sid) {
      this.sessionIdIndex.set(sid, sessionId);
    }

    // Update userId index
    const userId = session.userId;
    if (userId !== undefined) {
      if (!this.userIdIndex.has(userId)) {
        this.userIdIndex.set(userId, new Set());
      }
      this.userIdIndex.get(userId)?.add(sessionId);
    }
  }

  /**
   * Remove session from internal indexes
   */
  private removeFromIndexes(sessionId: string, session: Session | undefined): void {
    if (!session) {
      return;
    }

    // Remove from sid index
    const sid = session.oidc?.sid;
    if (sid) {
      this.sessionIdIndex.delete(sid);
    }

    // Remove from userId index
    const userId = session.userId;
    if (userId !== undefined) {
      const userSessions = this.userIdIndex.get(userId);
      if (userSessions) {
        userSessions.delete(sessionId);
        if (userSessions.size === 0) {
          this.userIdIndex.delete(userId);
        }
      }
    }
  }
}
