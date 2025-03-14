/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication } from '@nestjs/common';
import session from 'express-session';

import { AuthConfig } from '../config/auth.config';

export const HEDGEDOC_SESSION = 'hedgedoc-session';

/**
 * Set up the session middleware via the given authConfig
 *
 * @param app The nest application to configure the middleware for
 * @param authConfig - The authConfig to configure the middleware with
 * @param sessionStore - The storage backend that holds the session data
 */
export function setupSessionMiddleware(
  app: INestApplication,
  authConfig: AuthConfig,
  sessionStore: session.Store,
): void {
  app.use(
    session({
      name: HEDGEDOC_SESSION,
      secret: authConfig.session.secret,
      cookie: {
        // Handle session duration in seconds instead of ms
        maxAge: authConfig.session.lifetime * 1000,
      },
      resave: false,
      saveUninitialized: false,
      store: sessionStore,
    }),
  );
}
