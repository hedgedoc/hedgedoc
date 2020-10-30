/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { NestConsoleLoggerService } from './logger/nest-console-logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = await app.resolve(NestConsoleLoggerService);
  logger.log('Switching logger', 'AppBootstrap');
  app.useLogger(logger);
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('appConfig');

  const swaggerOptions = new DocumentBuilder()
    .setTitle('HedgeDoc')
    .setVersion('2.0-dev')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('apidoc', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      skipMissingProperties: false,
      transform: true,
    }),
  );
  if (appConfig.media.backend.use === 'filesystem') {
    app.useStaticAssets('uploads', {
      prefix: appConfig.media.backend.filesystem.uploadPath,
    });
  }
  await app.listen(appConfig.port);
  logger.log(`Listening on port ${appConfig.port}`, 'AppBootstrap');
}

bootstrap();
