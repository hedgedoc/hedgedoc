/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface ServerVersion {
  major: number;
  minor: number;
  patch: number;
  preRelease?: string;
  commit?: string;
}

export class ServerStatusDto {
  serverVersion: ServerVersion;
  onlineNotes: number;
  onlineUsers: number;
  destictOnlineUsers: number;
  notesCount: number;
  registeredUsers: number;
  onlineRegisteredUsers: number;
  distictOnlineRegisteredUsers: number;
  isConnectionBusy: boolean;
  connectionSocketQueueLenght: number;
  isDisconnectBusy: boolean;
  disconnectSocketQueueLength: number;
}
