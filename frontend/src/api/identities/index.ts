/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GetApiRequestBuilder } from '../common/api-request-builder/get-api-request-builder'
import { PostApiRequestBuilder } from '../common/api-request-builder/post-api-request-builder'
import type { LinkedIdentityInterface } from '@hedgedoc/commons'

interface OidcIdentityLinkResponse {
  url: string
}

/**
 * Retrieves the authentication identities linked to the current account.
 *
 * @returns The current account's linked identities.
 * @throws Error when the request fails.
 */
export const getLinkedIdentities = async (): Promise<LinkedIdentityInterface[]> => {
  const response = await new GetApiRequestBuilder<LinkedIdentityInterface[]>('me/identities').sendRequest()
  return response.asParsedJsonObject()
}

/**
 * Starts an OIDC transaction that links the provider identity to the current account.
 *
 * @param providerIdentifier The configured OIDC provider identifier.
 * @returns The provider authorization URL.
 * @throws Error when the request fails.
 */
export const startOidcIdentityLink = async (providerIdentifier: string): Promise<string> => {
  const response = await new PostApiRequestBuilder<OidcIdentityLinkResponse, never>(
    `auth/oidc/${providerIdentifier}/link`
  ).sendRequest()
  return (await response.asParsedJsonObject()).url
}
