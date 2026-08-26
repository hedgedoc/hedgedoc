/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type RealtimeUser = ShortRealtimeUser & {
  active: boolean
  cursor: RemoteCursor | null
}

export interface RemoteCursor {
  from: number
  to?: number
}

interface NormalUser {
  username: string
  guestUuid: null
}
interface GuestUser {
  username: null
  guestUuid: string
}
type NormalOrGuestUser = NormalUser | GuestUser

export type ShortRealtimeUser = NormalOrGuestUser & {
  displayName: string
  styleIndex: number
}
