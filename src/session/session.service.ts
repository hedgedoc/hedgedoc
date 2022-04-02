/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
import { Session } from '../users/session.entity';
import { HEDGEDOC_SESSION } from '../utils/session';

export interface SessionState {
  cookie: unknown;
  user: string;
  authProvider: string;
}

/**
 * Finds {@link Session sessions} by session id and verifies session cookies.
 */
@Injectable()
export class SessionService {
  private static readonly sessionCookieContentRegex = /^s:(([^.]+)\.(.+))$/;
  private readonly typeormStore: TypeormStore;

  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
    @Inject(databaseConfiguration.KEY)
    private dbConfig: DatabaseConfig,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
  ) {
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
  fetchUsernameForSessionId(sessionId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.typeormStore.get(sessionId, (error?: Error, result?: SessionState) =>
        error || !result ? reject(error) : resolve(result.user),
      );
    });
  }

  /**
   * Extracts the hedgedoc session cookie from the given {@link IncomingMessage request} and checks if the signature is correct.
   *
   * @param request The http request that contains a session cookie
   * @return The extracted session id
   * @throws Error if no session cookie was found
   * @throws Error if the cookie content is malformed
   * @throws Error if the cookie content isn't signed
   */
  extractVerifiedSessionIdFromRequest(request: IncomingMessage): string {
    return Optional.ofNullable(request.headers.cookie)
      .map((cookieHeader) => parseCookie(cookieHeader)[HEDGEDOC_SESSION])
      .orThrow(() => new Error(`No ${HEDGEDOC_SESSION} cookie found`))
      .map((cookie) => SessionService.sessionCookieContentRegex.exec(cookie))
      .orThrow(
        () =>
          new Error(
            `${HEDGEDOC_SESSION} cookie doesn't look like a signed cookie`,
          ),
      )
      .guard(
        (cookie) => unsign(cookie[1], this.authConfig.session.secret) !== false,
        () => new Error(`Signature of ${HEDGEDOC_SESSION} cookie isn't valid.`),
      )
      .map((cookie) => cookie[2])
      .get();
  }
}
