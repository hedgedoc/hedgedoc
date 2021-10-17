/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'
import type { AccessToken, AccessTokenSecret } from './types'

export const getAccessTokenList = async (): Promise<AccessToken[]> => {
  const response = await fetch(`${getApiUrl()}tokens`, {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return (await response.json()) as AccessToken[]
}

export const postNewAccessToken = async (label: string): Promise<AccessToken & AccessTokenSecret> => {
  const response = await fetch(`${getApiUrl()}tokens`, {
    ...defaultFetchConfig,
    method: 'POST',
    body: label
  })
  expectResponseCode(response)
  return (await response.json()) as AccessToken & AccessTokenSecret
}

export const deleteAccessToken = async (timestamp: number): Promise<void> => {
  const response = await fetch(`${getApiUrl()}tokens/${timestamp}`, {
    ...defaultFetchConfig,
    method: 'DELETE'
  })
  expectResponseCode(response)
}
