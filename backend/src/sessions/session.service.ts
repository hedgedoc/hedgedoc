/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FullUserInfoDto, ProviderType } from '@hedgedoc/commons';
import { Optional } from '@mrdrogdrog/optional';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeormStore } from 'connect-typeorm';
import { parse as parseCookie } from 'cookie';
import { unsign } from 'cookie-signature';
import { IncomingMessage } from 'http';
import { Repository } from 'typeorm';

import authConfiguration, { AuthConfig } from '../config/auth.config';
import { DatabaseType } from '../config/database-type.enum';
import databaseConfiguration, {
  DatabaseConfig,
} from '../config/database.config';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { HEDGEDOC_SESSION } from '../utils/session';
import { Session } from './session.entity';

export interface SessionState {
  /** Details about the currently used session cookie */
  cookie: unknown;

  /** Contains the username if logged in completely, is undefined when not being logged in */
  username?: string;

  /** The auth provider that is used for the current login or pending login */
  authProviderType?: ProviderType;

  /** The identifier of the auth provider that is used for the current login or pending login */
  authProviderIdentifier?: string;

  /** The id token to identify a user session with an OIDC auth provider, required for the logout */
  oidcIdToken?: string;

  /** The (random) OIDC code for verifying that OIDC responses match the OIDC requests */
  oidcLoginCode?: string;

  /** The (random) OIDC state for verifying that OIDC responses match the OIDC requests */
  oidcLoginState?: string;

  /** The user id as provided from the external auth provider, required for matching to a HedgeDoc identity */
  providerUserId?: string;

  /** The user data of the user that is currently being created */
  newUserData?: FullUserInfoDto;
}

/**
 * Finds {@link Session sessions} by session id and verifies session cookies.
 */
@Injectable()
export class SessionService {
  private static readonly sessionCookieContentRegex = /^s:(([^.]+)\.(.+))$/;
  private readonly typeormStore: TypeormStore;

  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
    @Inject(databaseConfiguration.KEY)
    private dbConfig: DatabaseConfig,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
  ) {
    this.logger.setContext(SessionService.name);
    this.typeormStore = new TypeormStore({
      cleanupLimit: 2,
      limitSubquery: dbConfig.type !== DatabaseType.MARIADB,
    }).connect(sessionRepository);
  }

  getTypeormStore(): TypeormStore {
    return this.typeormStore;
  }

  /**
   * Finds the username of the user that own the given session id.
   *
   * @async
   * @param sessionId The session id for which the owning user should be found
   * @return A Promise that either resolves with the username or rejects with an error
   */
  fetchUsernameForSessionId(sessionId: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      this.logger.debug(
        `Fetching username for sessionId ${sessionId}`,
        'fetchUsernameForSessionId',
      );
      this.typeormStore.get(
        sessionId,
        (error?: Error, result?: SessionState) => {
          this.logger.debug(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `Got error ${error}, result ${result?.username} for sessionId ${sessionId}`,
            'fetchUsernameForSessionId',
          );
          if (error) return reject(error);
          return resolve(result?.username);
        },
      );
    });
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
   * Parses the given session cookie content and extracts the session id.
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
