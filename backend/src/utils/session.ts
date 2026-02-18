/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication } from '@nestjs/common';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { AuthConfig } from '../config/auth.config';
import { KnexSessionStore } from '../sessions/knex-session-store';

export const HEDGEDOC_SESSION = 'hedgedoc-session';

/**
 * Set up the session middleware via the given authConfig
 *
 * @param app The nest application to configure the middleware for
 * @param authConfig - The authConfig to configure the middleware with
 * @param sessionStore - The storage backend that holds the session data
 */
export async function setupSessionMiddleware(
  app: INestApplication,
  authConfig: AuthConfig,
  sessionStore: KnexSessionStore,
): Promise<void> {
  const fastifyApp = app as NestFastifyApplication;

  await fastifyApp.register(fastifyCookie);
  await fastifyApp.register(fastifySession, {
    cookieName: HEDGEDOC_SESSION,
    cookiePrefix: 's:',
    secret: authConfig.session.secret,
    cookie: {
      // Handle session duration in seconds instead of ms
      maxAge: authConfig.session.lifetime * 1000,
      secure: 'auto',
      httpOnly: true,
      sameSite: 'lax',
    },
    saveUninitialized: false,
    store: sessionStore,
  });
}
