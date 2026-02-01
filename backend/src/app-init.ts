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
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyHelmet from '@fastify/helmet';

import { AppConfig } from './config/app.config';
import { AuthConfig } from './config/auth.config';
import { MediaConfig } from './config/media.config';
import { SecurityConfig } from './config/security.config';
import { ErrorExceptionMapping } from './errors/error-mapping';
import { ConsoleLoggerService } from './logger/console-logger.service';
import { runMigrations } from './migrate';
import { SessionService } from './sessions/session.service';
import { isDevMode } from './utils/dev-mode';
import { setupSessionMiddleware } from './utils/session';
import { setupValidationPipe } from './utils/setup-pipes';
import { setupPrivateApiDocs, setupPublicApiDocs } from './utils/swagger';
import { INestApplication } from '@nestjs/common';
import {
  buildRateLimitResponse,
  generateRateLimitKey,
  getMaxLimitByRequestWithSecurityConfig,
  getTimeWindowByRequestWithSecurityConfig,
} from './security/rate-limiting';
import { buildCspDirectives } from './security/csp';

/**
 * Common setup function which is called by main.ts and the E2E tests.
 */
export async function setupApp(
  app: NestFastifyApplication,
  appConfig: AppConfig,
  authConfig: AuthConfig,
  mediaConfig: MediaConfig,
  securityConfig: SecurityConfig,
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

  // Setup CSP
  if (securityConfig.csp.enable) {
    const cspConfig = buildCspDirectives(appConfig, securityConfig);
    await app.register(fastifyHelmet, {
      contentSecurityPolicy: cspConfig,
      // Disable CORS headers since they are enabled below
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
    });
    const mode = securityConfig.csp.reportOnly ? 'report-only' : 'enforcement';
    logger.log(`CSP enabled in ${mode} mode`, 'AppBootstrap');
  } else {
    logger.log('CSP disabled', 'AppBootstrap');
  }

  // Setup rate limiting
  await app.register(fastifyRateLimit, {
    global: true,
    hook: 'preHandler',
    cache: 10000,
    skipOnError: true,
    keyGenerator: generateRateLimitKey,
    max: getMaxLimitByRequestWithSecurityConfig(securityConfig),
    timeWindow: getTimeWindowByRequestWithSecurityConfig(securityConfig),
    errorResponseBuilder: buildRateLimitResponse,
    allowList: securityConfig.rateLimit.bypass,
    enableDraftSpec: true,
  });
  logger.log('Rate limiting enabled', 'AppBootstrap');

  // Enable web security aspects
  app.enableCors({
    origin: appConfig.rendererBaseUrl,
  });
  logger.log(`Enabling CORS for '${appConfig.rendererBaseUrl}'`, 'AppBootstrap');
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
