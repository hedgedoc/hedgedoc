/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { defaultConfig } from '../../default-config'
import { clearCsrfToken } from '../../../../redux/csrf-token/methods'
import { Mock } from 'ts-mockery'

/**
 * Mock fetch api for tests.
 * Check that the given url and options are present in the request and return the given status code.
 *
 * @param expectedUrl the url that should be requested
 * @param requestStatusCode the status code the mocked request should return
 * @param expectedOptions additional options
 */
export const expectFetch = (
  expectedUrl: string,
  requestStatusCode: number,
  expectedOptions: RequestInit,
  responseBody?: unknown
): void => {
  clearCsrfToken()

  global.fetch = jest.fn((fetchUrl: RequestInfo | URL, fetchOptions?: RequestInit): Promise<Response> => {
    // Handle CSRF token requests
    if (typeof fetchUrl === 'string' && fetchUrl.endsWith('/api/private/csrf/token')) {
      return Promise.resolve(
        Mock.of<Response>({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: jest.fn(() => Promise.resolve({ token: 'mock-csrf-token' }))
        })
      )
    }

    expect(fetchUrl).toEqual(expectedUrl)

    // Merge expected headers with CSRF token for non-GET requests
    const expectedHeaders = expectedOptions.headers ? new Headers(expectedOptions.headers) : new Headers()
    if (expectedOptions.method && expectedOptions.method !== 'GET' && expectedOptions.method !== 'HEAD') {
      expectedHeaders.set('csrf-token', 'mock-csrf-token')
    }

    expect(fetchOptions).toStrictEqual({
      ...defaultConfig,
      body: undefined,
      ...expectedOptions,
      headers: expectedHeaders
    })
    return Promise.resolve(
      Mock.of<Response>({
        status: requestStatusCode,
        statusText: mapCodeToText(requestStatusCode),
        json: jest.fn(() => (responseBody ? Promise.resolve(responseBody) : Promise.reject(new Error())))
      })
    )
  }) as typeof global.fetch
}
const mapCodeToText = (code: number): string => {
  switch (code) {
    case 400:
      return 'bad_request'
    case 401:
      return 'forbidden'
    default:
      return 'unknown_code'
  }
}
