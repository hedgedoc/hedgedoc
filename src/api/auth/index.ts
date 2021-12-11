/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'

export const INTERACTIVE_LOGIN_METHODS = ['local', 'ldap']

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

/**
 * Requests to logout the current user.
 * @throws Error if logout is not possible.
 */
export const doLogout = async (): Promise<void> => {
  const response = await fetch(getApiUrl() + 'auth/logout', {
    ...defaultFetchConfig,
    method: 'DELETE'
  })

  expectResponseCode(response)
}
