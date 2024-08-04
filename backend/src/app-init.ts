/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';

import { AppConfig } from './config/app.config';
import { AuthConfig } from './config/auth.config';
import { MediaConfig } from './config/media.config';
import { ErrorExceptionMapping } from './errors/error-mapping';
import { ConsoleLoggerService } from './logger/console-logger.service';
import { BackendType } from './media/backends/backend-type.enum';
import { SessionService } from './sessions/session.service';
import { setupSpecialGroups } from './utils/createSpecialGroups';
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
  await setupPublicApiDocs(app);
  logger.log(
    `Serving OpenAPI docs for public API under '/api/doc/v2'`,
    'AppBootstrap',
  );

  if (process.env.NODE_ENV === 'development') {
    await setupPrivateApiDocs(app);
    logger.log(
      `Serving OpenAPI docs for private API under '/api/doc/private'`,
      'AppBootstrap',
    );
  }

  await setupSpecialGroups(app);

  setupSessionMiddleware(
    app,
    authConfig,
    app.get(SessionService).getTypeormStore(),
  );

  app.enableCors({
    origin: appConfig.rendererBaseUrl,
  });
  logger.log(
    `Enabling CORS for '${appConfig.rendererBaseUrl}'`,
    'AppBootstrap',
  );

  app.useGlobalPipes(setupValidationPipe(logger));

  if (mediaConfig.backend.use === BackendType.FILESYSTEM) {
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

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ErrorExceptionMapping(httpAdapter));
  app.useWebSocketAdapter(new WsAdapter(app));
  app.enableShutdownHooks();
}
