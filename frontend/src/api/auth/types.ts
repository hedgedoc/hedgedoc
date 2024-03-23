/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
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

export interface LogoutResponseDto {
  redirect: string
}

export interface UsernameCheckDto {
  username: string
}

export interface UsernameCheckResponseDto {
  usernameAvailable: boolean
}

export interface PendingUserConfirmDto {
  username: string
  displayName: string
  profilePicture: string | undefined
}

export interface LdapLoginResponseDto {
  newUser: boolean
}
