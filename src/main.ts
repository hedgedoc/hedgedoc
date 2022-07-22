/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { setupApp } from './app-init';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { AuthConfig } from './config/auth.config';
import { MediaConfig } from './config/media.config';
import { ConsoleLoggerService } from './logger/console-logger.service';

async function bootstrap(): Promise<void> {
  // Initialize AppModule
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'] as LogLevel[],
    bufferLogs: true,
  });

  // Set up our custom logger
  const logger = await app.resolve(ConsoleLoggerService);
  logger.log('Switching logger', 'AppBootstrap');
  app.useLogger(logger);

  // Initialize config and abort if we don't have a valid config
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('appConfig');
  const authConfig = configService.get<AuthConfig>('authConfig');
  const mediaConfig = configService.get<MediaConfig>('mediaConfig');

  if (!appConfig || !authConfig || !mediaConfig) {
    logger.error('Could not initialize config, aborting.', 'AppBootstrap');
    process.exit(1);
  }

  // Call common setup function which handles the rest
  // Setup code must be added there!
  await setupApp(app, appConfig, authConfig, mediaConfig, logger);

  /**
   * enableShutdownHooks consumes memory by starting listeners. In cases where you are running multiple Nest apps in a
   * single Node process (e.g., when running parallel tests with Jest), Node may complain about excessive listener processes.
   * For this reason, enableShutdownHooks is not enabled in the tests.
   */
  app.enableShutdownHooks();

  // Start the server
  await app.listen(appConfig.port);
  logger.log(`Listening on port ${appConfig.port}`, 'AppBootstrap');
}

void bootstrap();
