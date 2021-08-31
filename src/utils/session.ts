/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeormStore } from 'connect-typeorm';
import session from 'express-session';
import { Repository } from 'typeorm';

import { AuthConfig } from '../config/auth.config';
import { Session } from '../users/session.entity';

/**
 * Setup the session middleware via the given authConfig.
 * @param {INestApplication} app - the nest application to configure the middleware for.
 * @param {AuthConfig} authConfig - the authConfig to configure the middleware with.
 */
export function setupSessionMiddleware(
  app: INestApplication,
  authConfig: AuthConfig,
): void {
  app.use(
    session({
      name: 'hedgedoc-session',
      secret: authConfig.session.secret,
      cookie: {
        maxAge: authConfig.session.lifetime,
      },
      resave: false,
      saveUninitialized: false,
      store: new TypeormStore({
        cleanupLimit: 2,
        ttl: 86400,
      }).connect(app.get<Repository<Session>>(getRepositoryToken(Session))),
    }),
  );
}
