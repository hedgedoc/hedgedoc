/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getMe } from '../../../api/me'
import { setUser } from '../../../redux/user/methods'
import { LoginProvider } from '../../../redux/user/types'

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
      provider: LoginProvider.LOCAL, // TODO Use real provider instead
      email: me.email
    })
  } catch (error) {
    console.error(error)
  }
}
