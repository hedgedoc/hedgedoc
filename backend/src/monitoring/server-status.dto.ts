/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BaseDto } from '../utils/base.dto.';

export class ServerVersion {
  @ApiProperty()
  major: number;
  @ApiProperty()
  minor: number;
  @ApiProperty()
  patch: number;
  @ApiPropertyOptional()
  preRelease?: string;
  @ApiPropertyOptional()
  commit?: string;
  @ApiProperty()
  fullString: string;
}

export class ServerStatusDto extends BaseDto {
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
