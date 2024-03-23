/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface UserInfo {
  username: string
  displayName: string
  photoUrl?: string
}

export interface FullUserInfo extends UserInfo {
  email: string
}
