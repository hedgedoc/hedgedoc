/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { LoginDto } from './types'
import { AuthError } from './types'

/**
 * Requests to log in a user via LDAP credentials.
 *
 * @param provider The identifier of the LDAP provider with which to login.
 * @param username The username with which to try the login.
 * @param password The password of the user.
 * @throws {AuthError.INVALID_CREDENTIALS} if the LDAP provider denied the given credentials.
 * @throws {Error} when the api request wasn't successfull
 */
export const doLdapLogin = async (provider: string, username: string, password: string): Promise<void> => {
  await new PostApiRequestBuilder<void, LoginDto>('auth/ldap/' + provider)
    .withJsonBody({
      username: username,
      password: password
    })
    .withStatusCodeErrorMapping({
      401: AuthError.INVALID_CREDENTIALS
    })
    .sendRequest()
}
