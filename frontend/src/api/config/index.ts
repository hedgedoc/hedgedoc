/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { isBuildTime } from '../../utils/test-modes'
import type { FrontendConfigDto } from '@hedgedoc/commons'

/**
 * Fetches the frontend config from the backend.
 *
 * @return The frontend config.
 * @throws {Error} when the api request wasn't successful.
 */
export const getConfig = async (baseUrl?: string): Promise<FrontendConfigDto | undefined> => {
  if (isBuildTime) {
    return undefined
  }
  const response = await new GetApiRequestBuilder<FrontendConfigDto>('config', baseUrl).sendRequest()
  return response.asParsedJsonObject()
}
