/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface RealtimeUser {
  username: string
  active: boolean
  styleIndex: number
  cursor: RemoteCursor
}

export interface RemoteCursor {
  from: number
  to?: number
}
