/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MediaBackendType } from '@hedgedoc/commons';
import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';

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

/**
 * Common setup function which is called by main.ts and the E2E tests.
 */
export async function setupApp(
  app: NestExpressApplication,
  appConfig: AppConfig,
  authConfig: AuthConfig,
  mediaConfig: MediaConfig,
  logger: ConsoleLoggerService,
): Promise<void> {
  logger.log('setupApp: start', 'AppBootstrap');
  logger.log('setupApp: setting up public API docs...', 'AppBootstrap');
  await setupPublicApiDocs(app);
  if (isDevMode()) {
    logger.log('setupApp: setting up private API docs...', 'AppBootstrap');
    await setupPrivateApiDocs(app);
  }

  logger.log('setupApp: running database migrations...', 'AppBootstrap');
  await runMigrations(app, logger);

  // Setup session handling
  logger.log('setupApp: configuring session middleware...', 'AppBootstrap');
  setupSessionMiddleware(
    app,
    authConfig,
    app.get(SessionService).getSessionStore(),
  );

  // Enable web security aspects
  logger.log('setupApp: enabling CORS...', 'AppBootstrap');
  app.enableCors({
    origin: appConfig.rendererBaseUrl,
  });
  logger.log(
    `Enabling CORS for '${appConfig.rendererBaseUrl}'`,
    'AppBootstrap',
  );
  // TODO Add rate limiting (#442)
  // TODO Add CSP (#1309)
  // TODO Add common security headers and CSRF (#201)

  // Setup class-validator for incoming API request data
  logger.log('setupApp: registering validation pipes...', 'AppBootstrap');
  app.useGlobalPipes(setupValidationPipe(logger));

  // Map URL paths to directories
  logger.log('setupApp: configuring static assets...', 'AppBootstrap');
  if (mediaConfig.backend.use === MediaBackendType.FILESYSTEM) {
    logger.log(
      `Serving the local folder '${mediaConfig.backend.filesystem.uploadPath}' under '/uploads'`,
      'AppBootstrap',
    );
    app.useStaticAssets(mediaConfig.backend.filesystem.uploadPath, {
      prefix: '/uploads/',
    });
  }
  logger.log(
    `Serving the local folder 'public' under '/public'`,
    'AppBootstrap',
  );
  app.useStaticAssets('public', {
    prefix: '/public/',
  });
  // TODO Evaluate whether we really need this folder,
  //  only use-cases for now are intro.md and motd.md which could be API endpoints as well

  // Configure WebSocket and error message handling
  logger.log('setupApp: configuring global filters and websocket adapter...', 'AppBootstrap');
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ErrorExceptionMapping(logger, httpAdapter));
  app.useWebSocketAdapter(new WsAdapter(app));

  // Enable hooks on app shutdown, like saving notes into the database
  logger.log('setupApp: enabling shutdown hooks...', 'AppBootstrap');
  app.enableShutdownHooks();
  logger.log('setupApp: done', 'AppBootstrap');
}
