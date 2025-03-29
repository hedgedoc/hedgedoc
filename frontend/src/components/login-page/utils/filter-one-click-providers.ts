/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { AuthProviderDto } from '@hedgedoc/commons'
import { ProviderType } from '@hedgedoc/commons'

/**
 * Filters the given auth providers to one-click providers only.
 * @param authProviders The auth providers to filter
 * @return only one click auth providers
 */
export const filterOneClickProviders = (authProviders: AuthProviderDto[]) => {
  return authProviders.filter((provider: AuthProviderDto): boolean => provider.type === ProviderType.OIDC)
}
