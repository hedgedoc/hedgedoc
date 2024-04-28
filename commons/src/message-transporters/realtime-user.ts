/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface RealtimeUser extends ShortRealtimeUser {
  active: boolean
  cursor: RemoteCursor | null
}

export interface RemoteCursor {
  from: number
  to?: number
}

export interface ShortRealtimeUser {
  displayName: string
  styleIndex: number
  username: string | null
}
