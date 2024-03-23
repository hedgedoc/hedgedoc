/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication } from '@nestjs/common';
import { TypeormStore } from 'connect-typeorm';
import session from 'express-session';

import { AuthConfig } from '../config/auth.config';

export const HEDGEDOC_SESSION = 'hedgedoc-session';

/**
 * Set up the session middleware via the given authConfig.
 * @param {INestApplication} app - the nest application to configure the middleware for.
 * @param {AuthConfig} authConfig - the authConfig to configure the middleware with.
 * @param {TypeormStore} typeormStore - the typeormStore to handle session data.
 */
export function setupSessionMiddleware(
  app: INestApplication,
  authConfig: AuthConfig,
  typeormStore: TypeormStore,
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
      store: typeormStore,
    }),
  );
}
