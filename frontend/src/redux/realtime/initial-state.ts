/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RealtimeStatus } from './types'

export const initialState: RealtimeStatus = {
  isSynced: false,
  isConnected: false,
  onlineUsers: [],
  ownUser: {
    displayName: '',
    styleIndex: 0
  }
}
