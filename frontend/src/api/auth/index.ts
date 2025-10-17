/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { LogoutResponseInterface, UsernameCheckInterface, UsernameCheckResponseInterface } from '@hedgedoc/commons'

/**
 * Requests to log out the current user.
 *
 * @throws {Error} if logout is not possible.
 */
export const doLogout = async (): Promise<LogoutResponseInterface> => {
  const response = await new DeleteApiRequestBuilder<LogoutResponseInterface>('auth/logout').sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Requests to check if a username is available.
 *
 * @param username The username to check.
 * @returns {boolean} whether the username is available or not.
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  const response = await new PostApiRequestBuilder<UsernameCheckResponseInterface, UsernameCheckInterface>(
    'users/check'
  )
    .withJsonBody({ username })
    .sendRequest()
  const json = await response.asParsedJsonObject()
  return json.usernameAvailable
}
