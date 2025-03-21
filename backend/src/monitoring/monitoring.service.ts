/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ServerStatusDto } from '@hedgedoc/commons';
import { Injectable } from '@nestjs/common';

import { getServerVersionFromPackageJson } from '../utils/serverVersion';

@Injectable()
export class MonitoringService {
  // TODO Implement Server Status and other routes (https://github.com/hedgedoc/hedgedoc/issues/478)
  async getServerStatus(): Promise<ServerStatusDto> {
    return {
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
  }
}
