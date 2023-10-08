/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';

import { AppModule } from './app.module';
import { AppConfig } from './config/app.config';
import { Loglevel } from './config/loglevel.enum';
import { ConsoleLoggerService } from './logger/console-logger.service';

async function buildDataSource(): Promise<DataSource> {
  // We create a new app instance to let it discover entities
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLoggerService({ loglevel: Loglevel.TRACE } as AppConfig),
  });
  const dataSource = app.get(DataSource);

  // The migration CLI does not want an existing connection
  await dataSource.destroy();

  return dataSource;
}

export default buildDataSource();
