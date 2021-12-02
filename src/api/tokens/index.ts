/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'
import type { AccessToken, AccessTokenWithSecret } from './types'

export const getAccessTokenList = async (): Promise<AccessToken[]> => {
  const response = await fetch(`${getApiUrl()}tokens`, {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return (await response.json()) as AccessToken[]
}

export const postNewAccessToken = async (label: string, expiryDate: string): Promise<AccessTokenWithSecret> => {
  const response = await fetch(`${getApiUrl()}tokens`, {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      label: label,
      validUntil: expiryDate
    })
  })
  expectResponseCode(response)
  return (await response.json()) as AccessTokenWithSecret
}

export const deleteAccessToken = async (keyId: string): Promise<void> => {
  const response = await fetch(`${getApiUrl()}tokens/${keyId}`, {
    ...defaultFetchConfig,
    method: 'DELETE'
  })
  expectResponseCode(response)
}
