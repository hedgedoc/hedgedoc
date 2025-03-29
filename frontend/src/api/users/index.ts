/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import type { UserInfoDto } from '@hedgedoc/commons'

/**
 * Retrieves information about a specific user while using a cache to avoid many requests for the same username.
 *
 * @param username The username of interest.
 * @return Metadata about the requested user.
 * @throws {Error} when the api request wasn't successful.
 */
export const getUserInfo = async (username: string): Promise<UserInfoDto> => {
  const response = await new GetApiRequestBuilder<UserInfoDto>(`users/profile/${username}`).sendRequest()
  return response.asParsedJsonObject()
}
