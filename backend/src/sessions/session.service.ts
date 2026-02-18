/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameUser, User } from '@hedgedoc/database';
import { Inject, Injectable } from '@nestjs/common';
import { fastifyCookie } from '@fastify/cookie';
import { IncomingMessage } from 'http';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';
import { promisify } from 'node:util';

import authConfiguration, { AuthConfig } from '../config/auth.config';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { HEDGEDOC_SESSION } from '../utils/session';
import { KnexSessionStore } from './knex-session-store';

/**
 * Finds {@link Session sessions} by session id and verifies session cookies.
 */
@Injectable()
export class SessionService {
  private static readonly sessionCookieContentRegex = /^s:(([^.]+)\.(.+))$/;
  private readonly sessionStore: KnexSessionStore;

  constructor(
    private readonly logger: ConsoleLoggerService,

    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,

    @InjectConnection()
    private readonly knex: Knex,
  ) {
    this.logger.setContext(SessionService.name);
    this.sessionStore = new KnexSessionStore({
      ttl: authConfig.session.lifetime,
      knex: this.knex,
    });
  }

  /**
   * Returns the currently used session store for usage outside of the HTTP session context
   * Note that this method is also used for connecting the session store with NestJS initially
   *
   * @returns The used session store
   */
  getFastifySessionStore(): KnexSessionStore {
    return this.sessionStore;
  }

  /**
   * Finds the username of the user that has the given session id
   *
   * @param sessionId The session id for which the owning user should be found
   * @returns A Promise that either resolves with the username or rejects with an error
   */
  async getUserIdForSessionId(sessionId: string): Promise<User[FieldNameUser.id] | undefined> {
    const getSession = promisify(this.sessionStore.get);
    const session = await getSession(sessionId);
    return session?.userId ?? undefined;
  }

  /**
   * Extracts the HedgeDoc session cookie from the given {@link IncomingMessage request} and checks if the signature is correct.
   *
   * @param request The http request that contains a session cookie
   * @returns An {@link Optional optional} that either contains the extracted session id or is empty if no session cookie has been found
   * @throws Error if the cookie has been found but the content is malformed
   * @throws Error if the cookie has been found but the content isn't signed
   */
  extractSessionIdFromRequest(request: IncomingMessage): string | null {
    const cookies = fastifyCookie.parse(request.headers.cookie ?? '');
    const sessionCookie = cookies[HEDGEDOC_SESSION];
    if (!sessionCookie) {
      return null;
    }
    return this.extractVerifiedSessionIdFromCookieContent(sessionCookie);
  }

  /**
   * Parses the given session cookie content and extracts the session id
   *
   * @param rawCookie The cookie to parse
   * @returns The extracted session id
   * @throws Error if the cookie has been found but the content is malformed
   * @throws Error if the cookie has been found but the content isn't signed
   */
  private extractVerifiedSessionIdFromCookieContent(rawCookie: string): string {
    const parsedCookie = SessionService.sessionCookieContentRegex.exec(rawCookie);
    if (parsedCookie === null) {
      throw new Error(`cookie "${HEDGEDOC_SESSION}" doesn't look like a signed session cookie`);
    }
    if (!fastifyCookie.unsign(parsedCookie[1], this.authConfig.session.secret).valid) {
      throw new Error(`signature of cookie "${HEDGEDOC_SESSION}" isn't valid.`);
    }
    return parsedCookie[2];
  }

  // /**
  //  * Terminates a session by OIDC session ID (sid)
  //  *
  //  * @param oidcSid The OIDC session ID
  //  * @returns Promise that resolves to true if a session was terminated, false otherwise
  //  */
  // async terminateSessionByOidcSid(oidcSid: string): Promise<boolean> {
  //   const sessionId = await this.sessionStore.findSessionIdBySid(oidcSid);
  //   if (!sessionId) {
  //     return false;
  //   }
  //
  //   return new Promise((resolve, reject) => {
  //     this.sessionStore.destroy(sessionId, (error) => {
  //       if (error) {
  //         reject(error);
  //       } else {
  //         resolve(true);
  //       }
  //     });
  //   });
  // }
  //
  // /**
  //  * Terminates all sessions for a given user
  //  *
  //  * @param userId The user ID
  //  * @returns Promise that resolves to the number of sessions terminated
  //  */
  // async terminateAllUserSessions(userId: User[FieldNameUser.id]): Promise<number> {
  //   const sessionIds = await this.sessionStore.findSessionIdsByUserId(userId);
  //   if (sessionIds.length === 0) {
  //     return 0;
  //   }
  //
  //   await this.sessionStore.destroyMultiple(sessionIds);
  //   return sessionIds.length;
  // }
}
