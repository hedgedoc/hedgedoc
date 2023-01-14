/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface LoginDto {
  username: string
  password: string
}

export interface RegisterDto {
  username: string
  password: string
  displayName: string
}

export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}
