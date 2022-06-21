/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppConfig } from './config/app.config';
import { AuthConfig } from './config/auth.config';
import { MediaConfig } from './config/media.config';
import { ErrorExceptionMapping } from './errors/error-mapping';
import { ConsoleLoggerService } from './logger/console-logger.service';
import { BackendType } from './media/backends/backend-type.enum';
import { SessionService } from './session/session.service';
import { setupSpecialGroups } from './utils/createSpecialGroups';
import { setupFrontendProxy } from './utils/frontend-integration';
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
  setupPublicApiDocs(app);
  logger.log(
    `Serving OpenAPI docs for public api under '/apidoc'`,
    'AppBootstrap',
  );

  if (process.env.NODE_ENV === 'development') {
    setupPrivateApiDocs(app);
    logger.log(
      `Serving OpenAPI docs for private api under '/private/apidoc'`,
      'AppBootstrap',
    );

    await setupFrontendProxy(app, logger);
  }

  await setupSpecialGroups(app);

  setupSessionMiddleware(
    app,
    authConfig,
    app.get(SessionService).getTypeormStore(),
  );

  app.enableCors({
    origin: appConfig.rendererOrigin,
  });
  logger.log(`Enabling CORS for '${appConfig.rendererOrigin}'`, 'AppBootstrap');

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
}
