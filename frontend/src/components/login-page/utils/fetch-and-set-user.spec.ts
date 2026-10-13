/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AuthProviderType, type LoginUserInfoInterface } from '@hedgedoc/commons'
import { Mock } from 'ts-mockery'
import { store } from '../../../redux'
import { clearUser } from '../../../redux/user/methods'
import { fetchAndSetUser } from './fetch-and-set-user'

describe('fetchAndSetUser', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    clearUser()
    global.fetch = originalFetch
  })

  it('stores user data from API in application state', async () => {
    const user: LoginUserInfoInterface = {
      username: 'test-user',
      displayName: 'Test User',
      photoUrl: null,
      email: null,
      authProvider: AuthProviderType.LOCAL,
      admin: true
    }
    global.fetch = jest.fn(() =>
      Promise.resolve(
        Mock.of<Response>({
          status: 200,
          headers: Mock.of<Headers>({ get: () => 'application/json' }),
          json: () => Promise.resolve(user)
        })
      )
    )

    await fetchAndSetUser()

    expect(store.getState().user).toStrictEqual(user)
  })
})
