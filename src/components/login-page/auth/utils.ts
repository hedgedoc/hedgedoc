/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getMe } from '../../../api/me'
import { setUser } from '../../../redux/user/methods'
import type { AuthProvider } from '../../../api/config/types'
import { authProviderTypeOneClick } from '../../../api/config/types'

/**
 * Fetches metadata about the currently signed-in user from the API and stores it into the redux.
 */
export const fetchAndSetUser: () => Promise<void> = async () => {
  try {
    const me = await getMe()
    setUser({
      username: me.username,
      displayName: me.displayName,
      photo: me.photo,
      authProvider: me.authProvider,
      email: me.email
    })
  } catch (error) {
    console.error(error)
  }
}

/**
 * Filter to apply to a list of auth providers to get only one-click providers.
 *
 * @param provider The provider to test whether it is a one-click provider or not.
 * @return {@link true} when the provider is a one-click one, {@link false} otherwise.
 */
export const filterOneClickProviders = (provider: AuthProvider): boolean => {
  return authProviderTypeOneClick.includes(provider.type)
}
