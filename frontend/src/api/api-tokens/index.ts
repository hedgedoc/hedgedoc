/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DeleteApiRequestBuilder } from '../common/api-request-builder/delete-api-request-builder'
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { ApiTokenCreateDto, ApiTokenDto, ApiTokenWithSecretDto } from '@hedgedoc/commons'

/**
 * Retrieves the access tokens for the current user.
 *
 * @return List of access token metadata.
 * @throws {Error} when the api request wasn't successful.
 */
export const getAccessTokenList = async (): Promise<ApiTokenDto[]> => {
  const response = await new GetApiRequestBuilder<ApiTokenDto[]>('tokens').sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Creates a new access token for the current user.
 *
 * @param label The user-defined label for the new access token.
 * @param validUntil The user-defined expiry date of the new access token in milliseconds of unix time.
 * @return The new access token metadata along with its secret.
 * @throws {Error} when the api request wasn't successful.
 */
export const postNewAccessToken = async (label: string, validUntil: Date): Promise<ApiTokenWithSecretDto> => {
  const response = await new PostApiRequestBuilder<ApiTokenWithSecretDto, ApiTokenCreateDto>('tokens')
    .withJsonBody({
      label,
      validUntil
    })
    .sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Removes an access token from the current user account.
 *
 * @param keyId The key id of the access token to delete.
 * @throws {Error} when the api request wasn't successful.
 */
export const deleteAccessToken = async (keyId: string): Promise<void> => {
  await new DeleteApiRequestBuilder('tokens/' + keyId).sendRequest()
}
