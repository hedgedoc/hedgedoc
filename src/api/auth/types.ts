/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export enum AuthError {
  INVALID_CREDENTIALS = 'invalidCredentials',
  LOGIN_DISABLED = 'loginDisabled',
  OPENID_ERROR = 'openIdError',
  OTHER = 'other'
}

export enum RegisterError {
  USERNAME_EXISTING = 'usernameExisting',
  REGISTRATION_DISABLED = 'registrationDisabled',
  OTHER = 'other'
}

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
