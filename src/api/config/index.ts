/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'
import type { Config } from './types'

export const getConfig = async (): Promise<Config> => {
  const response = await fetch(getApiUrl() + 'config', {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return (await response.json()) as Promise<Config>
}
