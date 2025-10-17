/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';

import { ServerStatusDto } from '../dtos/server-status.dto';
import { getServerVersionFromPackageJson } from '../utils/server-version';

@Injectable()
export class MonitoringService {
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
}
