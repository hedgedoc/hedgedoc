/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { AuthConfig } from './config/auth.config';
import { MediaConfig } from './config/media.config';
import { ErrorExceptionMapping } from './errors/error-mapping';
import { ConsoleLoggerService } from './logger/console-logger.service';
import { BackendType } from './media/backends/backend-type.enum';
import { setupSpecialGroups } from './utils/createSpecialGroups';
import { setupFrontendProxy } from './utils/frontend-integration';
import { setupSessionMiddleware } from './utils/session';
import { setupValidationPipe } from './utils/setup-pipes';
import { setupPrivateApiDocs, setupPublicApiDocs } from './utils/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'] as LogLevel[],
    bufferLogs: true,
  });
  const logger = await app.resolve(ConsoleLoggerService);
  logger.log('Switching logger', 'AppBootstrap');
  app.useLogger(logger);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('appConfig');
  const authConfig = configService.get<AuthConfig>('authConfig');
  const mediaConfig = configService.get<MediaConfig>('mediaConfig');

  if (!appConfig || !authConfig || !mediaConfig) {
    logger.error('Could not initialize config, aborting.', 'AppBootstrap');
    process.exit(1);
  }

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
    setupFrontendProxy(app, logger);
  }

  await setupSpecialGroups(app);

  setupSessionMiddleware(app, authConfig);

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
  app.useGlobalFilters(new ErrorExceptionMapping());
  await app.listen(appConfig.port);
  logger.log(`Listening on port ${appConfig.port}`, 'AppBootstrap');
}

void bootstrap();
