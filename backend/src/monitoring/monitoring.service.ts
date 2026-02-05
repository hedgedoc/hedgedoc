/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

import { ServerStatusDto } from '../dtos/server-status.dto';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { getServerVersionFromPackageJson } from '../utils/server-version';
import { checkDatabaseHealthWithKnex } from '../database/utils/healthcheck';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @InjectConnection()
    private readonly knex: Knex,
  ) {
    this.logger.setContext(MonitoringService.name);
  }

  // TODO Implement Server Status and other routes (https://github.com/hedgedoc/hedgedoc/issues/478)
  async getServerStatus(): Promise<ServerStatusDto> {
    const mockMonitoringStats = {
      connectionSocketQueueLength: 0,
      distinctOnlineUsers: 0,
      disconnectSocketQueueLength: 0,
      distinctOnlineRegisteredUsers: 0,
      isConnectionBusy: false,
      isDisconnectBusy: false,
      notesCount: 0,
      onlineNotes: 0,
      onlineRegisteredUsers: 0,
      onlineUsers: 0,
      registeredUsers: 0,
      serverVersion: await getServerVersionFromPackageJson(),
    };
    return ServerStatusDto.create(mockMonitoringStats);
  }

  /**
   * Checks if the application is healthy by testing the database connection.
   *
   * @returns true if the application is healthy, false otherwise
   */
  async isHealthy(): Promise<boolean> {
    const dbReady = await checkDatabaseHealthWithKnex(this.knex);
    if (!dbReady) {
      this.logger.error('Health check failed: Database is not ready', undefined, 'isHealthy');
      return false;
    }
    return true;
  }
}
