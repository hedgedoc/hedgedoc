/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RealtimeUser } from '@hedgedoc/commons'

export interface SetRealtimeUsersPayload {
  users: RealtimeUser[]
  ownUser: {
    styleIndex: number
    displayName: string
  }
}

export interface RealtimeStatus {
  onlineUsers: RealtimeUser[]
  isConnected: boolean
  isSynced: boolean
  ownUser: {
    displayName: string
    styleIndex: number
  }
}
