/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getMe } from '../../../api/me'
import { setUser } from '../../../redux/user/methods'

/**
 * Fetches metadata about the currently signed-in user from the API and stores it into the redux.
 */
export const fetchAndSetUser: () => Promise<void> = async () => {
  const me = await getMe()
  setUser({
    username: me.username,
    displayName: me.displayName,
    photoUrl: me.photoUrl,
    authProvider: me.authProvider,
    email: me.email
  })
}
