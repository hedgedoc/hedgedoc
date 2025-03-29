/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { LdapLoginDto, LdapLoginResponseDto } from '@hedgedoc/commons'

/**
 * Requests to log in a user via LDAP credentials.
 *
 * @param provider The identifier of the LDAP provider with which to login.
 * @param username The username with which to try the login.
 * @param password The password of the user.
 * @throws {Error} when the api request wasn't successfull
 */
export const doLdapLogin = async (
  provider: string,
  username: string,
  password: string
): Promise<LdapLoginResponseDto> => {
  const response = await new PostApiRequestBuilder<LdapLoginResponseDto, LdapLoginDto>(`auth/ldap/${provider}/login`)
    .withJsonBody({
      username: username,
      password: password
    })
    .sendRequest()
  return await response.asParsedJsonObject()
}
