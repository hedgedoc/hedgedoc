/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AuthProviderType } from '@hedgedoc/commons'
import { clearCsrfToken } from '../../../redux/csrf-token/methods'
import { store } from '../../../redux'
import { clearUser } from '../../../redux/user/methods'
import { loginOrRegisterGuest } from './login-or-register-guest'
import { Mock } from 'ts-mockery'

const mockResponses = {
  '/api/private/csrf/token': Mock.of<Response>({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ token: 'csrf-token' })
  }),
  '/api/private/auth/guest/register': Mock.of<Response>({
    status: 201,
    headers: Mock.of<Headers>({ get: () => 'application/json' }),
    json: () => Promise.resolve({ uuid: 'guest-xyz' })
  }),
  '/api/private/me': Mock.of<Response>({
    status: 200,
    headers: Mock.of<Headers>({ get: () => 'application/json' }),
    json: () =>
      Promise.resolve({
        username: null,
        displayName: 'Guest XYZ',
        photoUrl: null,
        authProvider: AuthProviderType.GUEST,
        email: null
      })
  })
}

describe('loginOrRegisterGuest', () => {
  const originalFetch = global.fetch

  beforeAll(() => {
    global.fetch = jest.fn((url: RequestInfo | URL) => {
      if (typeof url === 'string' && url in mockResponses) {
        return Promise.resolve(mockResponses[url as keyof typeof mockResponses])
      }
      return Promise.reject(new Error('Unexpected request'))
    }) as typeof global.fetch
  })

  beforeEach(() => {
    window.localStorage.clear()
    clearCsrfToken()
    clearUser()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it('stores guest users into the application state and localStorage', async () => {
    await loginOrRegisterGuest()

    expect(window.localStorage.getItem('guestUuid')).toBe('guest-xyz')
    expect(store.getState().user).toStrictEqual({
      username: null,
      displayName: 'Guest XYZ',
      photoUrl: null,
      authProvider: AuthProviderType.GUEST,
      email: null
    })
    const fetchCalls = jest.mocked(global.fetch).mock.calls.map(([url]) => url)
    expect(fetchCalls).toStrictEqual(['/api/private/csrf/token', '/api/private/auth/guest/register', '/api/private/me'])
  })
})
