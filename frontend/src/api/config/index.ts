/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import type { FrontendConfig } from './types'
import { isBuildTime } from '@hedgedoc/commons'

/**
 * Fetches the frontend config from the backend.
 *
 * @return The frontend config.
 * @throws {Error} when the api request wasn't successful.
 */
export const getConfig = async (baseUrl?: string): Promise<FrontendConfig | undefined> => {
  if (isBuildTime) {
    return undefined
  }
  const response = await new GetApiRequestBuilder<FrontendConfig>('config', baseUrl).sendRequest()
  return response.asParsedJsonObject()
}
