/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { AuthProvider } from '../../../api/config/types'
import { authProviderTypeOneClick } from '../../../api/config/types'

/**
 * Filters the given auth providers to one-click providers only.
 * @param authProviders The auth providers to filter
 * @return only one click auth providers
 */
export const filterOneClickProviders = (authProviders: AuthProvider[]) => {
  return authProviders.filter((provider: AuthProvider): boolean => authProviderTypeOneClick.includes(provider.type))
}
