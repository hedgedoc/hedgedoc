/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defaultConfig } from '../../default-config'
import { Mock } from 'ts-mockery'

export const expectFetch = (expectedUrl: string, expectedStatusCode: number, expectedOptions: RequestInit): void => {
  global.fetch = jest.fn((fetchUrl: RequestInfo | URL, fetchOptions?: RequestInit): Promise<Response> => {
    expect(fetchUrl).toEqual(expectedUrl)
    expect(fetchOptions).toStrictEqual({
      ...defaultConfig,
      body: undefined,
      headers: new Headers(),
      ...expectedOptions
    })
    return Promise.resolve(
      Mock.of<Response>({
        status: expectedStatusCode
      })
    )
  })
}
