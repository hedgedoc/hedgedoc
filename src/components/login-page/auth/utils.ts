/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getMe } from '../../../api/me'
import { setUser } from '../../../redux/user/methods'

export const getAndSetUser: () => (Promise<void>) = async () => {
  const me = await getMe()
  setUser({
    id: me.id,
    name: me.name,
    photo: me.photo,
    provider: me.provider
  })
}
