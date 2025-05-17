/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameUser, User } from '@hedgedoc/database';
import { Optional } from '@mrdrogdrog/optional';
import { Inject, Injectable } from '@nestjs/common';
import { parse as parseCookie } from 'cookie';
import { unsign } from 'cookie-signature';
import { IncomingMessage } from 'http';

import authConfiguration, { AuthConfig } from '../config/auth.config';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { HEDGEDOC_SESSION } from '../utils/session';
import { KeyvSessionStore } from './keyv-session-store';
import { SessionState } from './session-state.type';

/**
 * Finds {@link Session sessions} by session id and verifies session cookies.
 */
@Injectable()
export class SessionService {
  private static readonly sessionCookieContentRegex = /^s:(([^.]+)\.(.+))$/;
  private readonly sessionStore: KeyvSessionStore<SessionState>;

  constructor(
    private readonly logger: ConsoleLoggerService,

    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
  ) {
    this.logger.setContext(SessionService.name);
    this.sessionStore = new KeyvSessionStore<SessionState>({
      ttl: authConfig.session.lifetime,
    });
  }

  /**
   * Returns the currently used session store for usage outside of the HTTP session context
   * Note that this method is also used for connecting the session store with NestJS initially
   *
   * @return The used session store
   */
  getSessionStore(): KeyvSessionStore<SessionState> {
    return this.sessionStore;
  }

  /**
   * Finds the username of the user that has the given session id
   *
   * @param sessionId The session id for which the owning user should be found
   * @return A Promise that either resolves with the username or rejects with an error
   */
  async getUserIdForSessionId(
    sessionId: string,
  ): Promise<User[FieldNameUser.id] | undefined> {
    const session = await this.sessionStore.getAsync(sessionId);
    return session?.userId;
  }

  /**
   * Extracts the hedgedoc session cookie from the given {@link IncomingMessage request} and checks if the signature is correct.
   *
   * @param request The http request that contains a session cookie
   * @return An {@link Optional optional} that either contains the extracted session id or is empty if no session cookie has been found
   * @throws Error if the cookie has been found but the content is malformed
   * @throws Error if the cookie has been found but the content isn't signed
   */
  extractSessionIdFromRequest(request: IncomingMessage): Optional<string> {
    return Optional.ofNullable(request.headers?.cookie)
      .map((cookieHeader) => parseCookie(cookieHeader)[HEDGEDOC_SESSION])
      .map((rawCookie) =>
        this.extractVerifiedSessionIdFromCookieContent(rawCookie),
      );
  }

  /**
   * Parses the given session cookie content and extracts the session id
   *
   * @param rawCookie The cookie to parse
   * @return The extracted session id
   * @throws Error if the cookie has been found but the content is malformed
   * @throws Error if the cookie has been found but the content isn't signed
   */
  private extractVerifiedSessionIdFromCookieContent(rawCookie: string): string {
    const parsedCookie =
      SessionService.sessionCookieContentRegex.exec(rawCookie);
    if (parsedCookie === null) {
      throw new Error(
        `cookie "${HEDGEDOC_SESSION}" doesn't look like a signed session cookie`,
      );
    }
    if (unsign(parsedCookie[1], this.authConfig.session.secret) === false) {
      throw new Error(`signature of cookie "${HEDGEDOC_SESSION}" isn't valid.`);
    }
    return parsedCookie[2];
  }
}
