/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { UserInfo } from './types'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'

/**
 * Retrieves information about a specific user while using a cache to avoid many requests for the same username.
 *
 * @param username The username of interest.
 * @return Metadata about the requested user.
 * @throws {Error} when the api request wasn't successful.
 */
export const getUser = async (username: string): Promise<UserInfo> => {
  const response = await new GetApiRequestBuilder<UserInfo>('users/' + username).sendRequest()
  return response.asParsedJsonObject()
}
