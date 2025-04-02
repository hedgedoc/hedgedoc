/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { setupApp } from './app-init';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { AuthConfig } from './config/auth.config';
import { Loglevel } from './config/loglevel.enum';
import { MediaConfig } from './config/media.config';
import { ConsoleLoggerService } from './logger/console-logger.service';

async function bootstrap(): Promise<void> {
  // Initialize AppModule
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // ConsoleLoggerService only uses the loglevel, so we can give it an incomplete AppConfig to log everything
    // This Logger instance will be replaced by a proper one with config from DI below
    logger: new ConsoleLoggerService({ loglevel: Loglevel.TRACE } as AppConfig),
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

  // Start the server
  await app.listen(appConfig.backendPort);
  logger.warn(`Listening on port ${appConfig.backendPort}`, 'AppBootstrap');
}

void bootstrap();
