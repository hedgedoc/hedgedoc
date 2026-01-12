/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { INestApplication } from '@nestjs/common';
import { Knex } from 'knex';
import { getConnectionToken } from 'nest-knexjs';

import { ConsoleLoggerService } from './logger/console-logger.service';

interface CompletedMigration {
  name: string;
}

interface PendingMigration {
  file: string;
  directory: string;
}

/**
 * Runs the database migrations and informs the user about already completed and still pending ones
 *
 * @param app The NestJS application instance
 * @param logger The console logger service to use
 */
export async function runMigrations(
  app: INestApplication,
  logger: ConsoleLoggerService,
): Promise<void> {
  const knexConnectionToken = getConnectionToken();
  const knex: Knex = app.get<Knex>(knexConnectionToken);
  logger.log('Checking for pending database migrations... ', 'runMigrations');
  try {
    const [completedMigrations, pendingMigrations] = (await knex.migrate.list()) as [
      CompletedMigration[],
      PendingMigration[],
    ];
    logger.log(
      `Found ${completedMigrations.length} already completed migrations and ${pendingMigrations.length} pending migrations.`,
      'runMigrations',
    );
    for (const migration of completedMigrations) {
      logger.log(`Already applied migration '${migration.name}'`, 'runMigrations');
    }
    for (const migration of pendingMigrations) {
      logger.log(`Applying migration '${migration.file}'`, 'runMigrations');
      await knex.migrate.up();
      logger.log('✅', 'runMigrations');
    }
  } catch (error: unknown) {
    logger.error(`Error while migrating database: ${String(error)}`);
    await app.close();
    process.exit(1);
  }

  logger.log('Finished database migrations... ', 'runMigrations');
}
