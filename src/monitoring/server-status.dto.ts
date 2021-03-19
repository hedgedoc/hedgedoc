/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ApiProperty } from '@nestjs/swagger';

export class ServerVersion {
  @ApiProperty()
  major: number;
  @ApiProperty()
  minor: number;
  @ApiProperty()
  patch: number;
  @ApiProperty()
  preRelease?: string;
  @ApiProperty()
  commit?: string;
}

export class ServerStatusDto {
  @ApiProperty()
  serverVersion: ServerVersion;
  @ApiProperty()
  onlineNotes: number;
  @ApiProperty()
  onlineUsers: number;
  @ApiProperty()
  distinctOnlineUsers: number;
  @ApiProperty()
  notesCount: number;
  @ApiProperty()
  registeredUsers: number;
  @ApiProperty()
  onlineRegisteredUsers: number;
  @ApiProperty()
  distinctOnlineRegisteredUsers: number;
  @ApiProperty()
  isConnectionBusy: boolean;
  @ApiProperty()
  connectionSocketQueueLength: number;
  @ApiProperty()
  isDisconnectBusy: boolean;
  @ApiProperty()
  disconnectSocketQueueLength: number;
}
