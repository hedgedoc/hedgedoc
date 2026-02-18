/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ConfigService } from '@nestjs/config';
import { AbstractHttpAdapter, NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { setupApp } from './app-init';
import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { AuthConfig } from './config/auth.config';
import { Loglevel } from './config/loglevel.enum';
import { MediaConfig } from './config/media.config';
import { SecurityConfig } from './config/security.config';
import { ConsoleLoggerService } from './logger/console-logger.service';
import { isDevMode } from './utils/dev-mode';
import { extendKnexQueryBuilder } from './database/extend-knex-query-builder';

async function bootstrap(): Promise<void> {
  // Initialize AppModule
  const app = (await NestFactory.create(
    AppModule,
    new FastifyAdapter({
      routerOptions: {
        ignoreTrailingSlash: true,
      },
    }) as AbstractHttpAdapter,
    {
      // ConsoleLoggerService only uses the loglevel, so we can give it an incomplete AppConfig to log everything
      // This Logger instance will be replaced by a proper one with config from DI below
      logger: isDevMode()
        ? new ConsoleLoggerService({
            log: { level: Loglevel.TRACE },
          } as AppConfig)
        : false,
    },
  )) as NestFastifyApplication;

  extendKnexQueryBuilder();

  // Set up our custom logger
  const logger = await app.resolve(ConsoleLoggerService);
  logger.debug('Switching logger', 'AppBootstrap');
  app.useLogger(logger);

  // Initialize config and abort if we don't have a valid config
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('appConfig');
  const authConfig = configService.get<AuthConfig>('authConfig');
  const mediaConfig = configService.get<MediaConfig>('mediaConfig');
  const securityConfig = configService.get<SecurityConfig>('securityConfig');

  if (!appConfig || !authConfig || !mediaConfig || !securityConfig) {
    logger.error('Could not initialize config, aborting.', undefined, 'AppBootstrap');
    await app.close();
    process.exit(1);
  }

  // Call common setup function which handles the rest
  // Setup code must be added there!
  await setupApp(app, appConfig, authConfig, mediaConfig, securityConfig, logger);

  // Start the server
  await app.listen(appConfig.backendPort);
}

void bootstrap();
