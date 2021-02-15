/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { MediaConfig } from './config/media.config';
import { NestConsoleLoggerService } from './logger/nest-console-logger.service';
import { setupPrivateApiDocs, setupPublicApiDocs } from './utils/swagger';
import { BackendType } from './media/backends/backend-type.enum';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = await app.resolve(NestConsoleLoggerService);
  logger.log('Switching logger', 'AppBootstrap');
  app.useLogger(logger);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('appConfig');
  const mediaConfig = configService.get<MediaConfig>('mediaConfig');

  setupPublicApiDocs(app);
  if (process.env.NODE_ENV === 'development') {
    setupPrivateApiDocs(app);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      skipMissingProperties: false,
      transform: true,
    }),
  );
  if (mediaConfig.backend.use === BackendType.FILESYSTEM) {
    logger.log(
      `Serving ${mediaConfig.backend.filesystem.uploadPath} under 'uploads/'`,
      'AppBootstrap',
    );
    app.useStaticAssets(mediaConfig.backend.filesystem.uploadPath, {
      prefix: '/uploads/',
    });
  }
  await app.listen(appConfig.port);
  logger.log(`Listening on port ${appConfig.port}`, 'AppBootstrap');
}

bootstrap();
