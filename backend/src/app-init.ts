/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MediaBackendType } from '@hedgedoc/commons';
import { HttpAdapterHost } from '@nestjs/core';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { WsAdapter } from '@nestjs/platform-ws';
import fastifyMultipart from '@fastify/multipart';
import fastifyCsrfProtection from '@fastify/csrf-protection';

import { AppConfig } from './config/app.config';
import { AuthConfig } from './config/auth.config';
import { MediaConfig } from './config/media.config';
import { ErrorExceptionMapping } from './errors/error-mapping';
import { ConsoleLoggerService } from './logger/console-logger.service';
import { runMigrations } from './migrate';
import { SessionService } from './sessions/session.service';
import { isDevMode } from './utils/dev-mode';
import { setupSessionMiddleware } from './utils/session';
import { setupValidationPipe } from './utils/setup-pipes';
import { setupPrivateApiDocs, setupPublicApiDocs } from './utils/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Common setup function which is called by main.ts and the E2E tests.
 */
export async function setupApp(
  app: NestFastifyApplication,
  appConfig: AppConfig,
  authConfig: AuthConfig,
  mediaConfig: MediaConfig,
  logger: ConsoleLoggerService,
): Promise<void> {
  // Setup OpenAPI documentation
  await setupPublicApiDocs(app as INestApplication);
  if (isDevMode()) {
    await setupPrivateApiDocs(app as INestApplication);
  }

  // Register multipart for file uploads
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: mediaConfig.maxUploadSize,
    },
  });

  // Register content-type parser for text/markdown
  app
    .getHttpAdapter()
    .getInstance()
    .addContentTypeParser(
      'text/markdown',
      { parseAs: 'string' },
      (_req: unknown, body: unknown, done: (err: Error | null, body: unknown) => void) => {
        done(null, body);
      },
    );

  await runMigrations(app as INestApplication, logger);

  // Setup session handling
  await setupSessionMiddleware(
    app as INestApplication,
    authConfig,
    app.get(SessionService).getSessionStore(),
  );

  // Setup CSRF protection
  await app.register(fastifyCsrfProtection, {
    cookieKey: 'hedgedoc-csrf',
    sessionPlugin: '@fastify/session',
    getToken: (req) => req.headers['csrf-token'] as string | undefined,
  });
  logger.log('CSRF protection enabled', 'AppBootstrap');

  // Enable web security aspects
  app.enableCors({
    origin: appConfig.rendererBaseUrl,
  });
  logger.log(`Enabling CORS for '${appConfig.rendererBaseUrl}'`, 'AppBootstrap');
  // TODO Add rate limiting (#442)
  // TODO Add CSP (#1309)
  // TODO Add common security headers (#201)

  // Setup class-validator for incoming API request data
  app.useGlobalPipes(setupValidationPipe(logger));

  // Map URL paths to directories
  if (mediaConfig.backend.type === MediaBackendType.FILESYSTEM) {
    logger.log(
      `Serving the local folder '${mediaConfig.backend.filesystem.uploadPath}' under '/uploads'`,
      'AppBootstrap',
    );
    const path = await import('path');
    await app.register(import('@fastify/static'), {
      root: path.resolve(mediaConfig.backend.filesystem.uploadPath),
      prefix: '/uploads/',
    });
  }
  logger.log(`Serving the local folder 'public' under '/public'`, 'AppBootstrap');
  const path = await import('path');
  await app.register(import('@fastify/static'), {
    root: path.resolve('public'),
    prefix: '/public/',
    decorateReply: false,
  });
  // TODO Evaluate whether we really need this folder,
  //  only use-cases for now are intro.md and motd.md which could be API endpoints as well

  // Configure WebSocket and error message handling
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ErrorExceptionMapping(logger, httpAdapter));
  app.useWebSocketAdapter(new WsAdapter(app));

  // Enable hooks on app shutdown, like saving notes into the database
  app.enableShutdownHooks();
}
