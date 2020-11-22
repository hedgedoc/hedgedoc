/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { UserResponse } from '../users/types'
import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'

export const getMe = async (): Promise<UserResponse> => {
  const response = await fetch(getApiUrl() + '/me', {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return (await response.json()) as UserResponse
}

export const updateDisplayName = async (displayName: string): Promise<void> => {
  const response = await fetch(getApiUrl() + '/me', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      name: displayName
    })
  })

  expectResponseCode(response)
}

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  const response = await fetch(getApiUrl() + '/me/password', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      oldPassword,
      newPassword
    })
  })

  expectResponseCode(response)
}

export const deleteUser = async (): Promise<void> => {
  const response = await fetch(getApiUrl() + '/me', {
    ...defaultFetchConfig,
    method: 'DELETE'
  })

  expectResponseCode(response)
}
