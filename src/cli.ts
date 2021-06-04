/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { AppModule } from './app.module';
import { ConsoleLoggerService } from './logger/console-logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'], // only errors
  });
  const logger = await app.resolve(ConsoleLoggerService);
  logger.log('Switching logger', 'AppBootstrap');
  app.useLogger(logger);
  app.select(CommandModule).get(CommandService).exec();
}

void bootstrap();
