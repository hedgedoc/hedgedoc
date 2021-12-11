/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { UserInfoDto } from '../users/types'
import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'
import { isMockMode } from '../../utils/test-modes'

/**
 * Returns metadata about the currently signed-in user from the API.
 * @throws Error when the user is not signed-in.
 * @return The user metadata.
 */
export const getMe = async (): Promise<UserInfoDto> => {
  const response = await fetch(getApiUrl() + `me${isMockMode() ? '-get' : ''}`, {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return (await response.json()) as UserInfoDto
}

export const updateDisplayName = async (displayName: string): Promise<void> => {
  const response = await fetch(getApiUrl() + 'me', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      name: displayName
    })
  })

  expectResponseCode(response)
}

export const deleteUser = async (): Promise<void> => {
  const response = await fetch(getApiUrl() + 'me', {
    ...defaultFetchConfig,
    method: 'DELETE'
  })

  expectResponseCode(response)
}
