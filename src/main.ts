/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestConsoleLoggerService } from './logger/nest-console-logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = await app.resolve(NestConsoleLoggerService);
  logger.log('Switching logger', 'AppBootstrap');
  app.useLogger(logger);

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
  // TODO: Get uploads directory from config
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });
  await app.listen(3000);
  logger.log('Listening on port 3000', 'AppBootstrap');
}

bootstrap();
