/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { UserInfo } from '../users/types'

export interface LoginUserInfo extends UserInfo {
  authProvider: string
  email: string
}

export interface ChangeDisplayNameDto {
  displayName: string
}
