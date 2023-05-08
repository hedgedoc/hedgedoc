/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface RealtimeUser {
  displayName: string
  username: string | null
  active: boolean
  styleIndex: number
  cursor: RemoteCursor | null
}

export interface RemoteCursor {
  from: number
  to?: number
}
