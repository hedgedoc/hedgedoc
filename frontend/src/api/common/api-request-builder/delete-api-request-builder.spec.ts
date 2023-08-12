/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ApiError } from '../api-error'
import type { ApiErrorResponse } from '../api-error-response'
import { DeleteApiRequestBuilder } from './delete-api-request-builder'
import { expectFetch } from './test-utils/expect-fetch'

describe('DeleteApiRequestBuilder', () => {
  let originalFetch: (typeof global)['fetch']

  beforeAll(() => {
    originalFetch = global.fetch
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it('uses the custom base url as prefix', async () => {
    expectFetch('https://example.org/api/private/test', 200, { method: 'DELETE' })
    await new DeleteApiRequestBuilder<string>('test', 'https://example.org/').sendRequest()
  })

  describe('sendRequest without body', () => {
    it('without headers', async () => {
      expectFetch('/api/private/test', 204, { method: 'DELETE' })
      await new DeleteApiRequestBuilder<string, undefined>('test').sendRequest()
    })

    it('with single header', async () => {
      const expectedHeaders = new Headers()
      expectedHeaders.append('test', 'true')
      expectFetch('/api/private/test', 204, {
        method: 'DELETE',
        headers: expectedHeaders
      })
      await new DeleteApiRequestBuilder<string, undefined>('test').withHeader('test', 'true').sendRequest()
    })

    it('with overriding single header', async () => {
      const expectedHeaders = new Headers()
      expectedHeaders.append('test', 'false')
      expectFetch('/api/private/test', 204, {
        method: 'DELETE',
        headers: expectedHeaders
      })
      await new DeleteApiRequestBuilder<string, undefined>('test')
        .withHeader('test', 'true')
        .withHeader('test', 'false')
        .sendRequest()
    })

    it('with multiple different headers', async () => {
      const expectedHeaders = new Headers()
      expectedHeaders.append('test', 'true')
      expectedHeaders.append('test2', 'false')
      expectFetch('/api/private/test', 204, {
        method: 'DELETE',
        headers: expectedHeaders
      })
      await new DeleteApiRequestBuilder<string, undefined>('test')
        .withHeader('test', 'true')
        .withHeader('test2', 'false')
        .sendRequest()
    })
  })

  it('sendRequest with JSON body', async () => {
    const expectedHeaders = new Headers()
    expectedHeaders.append('Content-Type', 'application/json')

    expectFetch('/api/private/test', 204, {
      method: 'DELETE',
      headers: expectedHeaders,
      body: '{"test":true,"foo":"bar"}'
    })
    await new DeleteApiRequestBuilder('test')
      .withJsonBody({
        test: true,
        foo: 'bar'
      })
      .sendRequest()
  })

  it('sendRequest with other body', async () => {
    expectFetch('/api/private/test', 204, {
      method: 'DELETE',
      body: 'HedgeDoc'
    })
    await new DeleteApiRequestBuilder('test').withBody('HedgeDoc').sendRequest()
  })

  describe('sendRequest with custom options', () => {
    it('with one option', async () => {
      expectFetch('/api/private/test', 204, {
        method: 'DELETE',
        cache: 'force-cache'
      })
      await new DeleteApiRequestBuilder<string, undefined>('test')
        .withCustomOptions({
          cache: 'force-cache'
        })
        .sendRequest()
    })

    it('overriding single option', async () => {
      expectFetch('/api/private/test', 204, {
        method: 'DELETE',
        cache: 'no-store'
      })
      await new DeleteApiRequestBuilder<string, undefined>('test')
        .withCustomOptions({
          cache: 'force-cache'
        })
        .withCustomOptions({
          cache: 'no-store'
        })
        .sendRequest()
    })

    it('with multiple options', async () => {
      expectFetch('/api/private/test', 204, {
        method: 'DELETE',
        cache: 'force-cache',
        integrity: 'test'
      })
      await new DeleteApiRequestBuilder<string, undefined>('test')
        .withCustomOptions({
          cache: 'force-cache',
          integrity: 'test'
        })
        .sendRequest()
    })
  })

  describe('failing sendRequest', () => {
    it('without backend provided error name or error message', async () => {
      expectFetch('/api/private/test', 400, { method: 'DELETE' })
      const request = new DeleteApiRequestBuilder<string>('test').sendRequest()
      await expect(request).rejects.toEqual(new ApiError(400, undefined, undefined))
    })

    it('with backend error name and error message', async () => {
      expectFetch('/api/private/test', 400, { method: 'DELETE' }, {
        message: 'The API has exploded!',
        name: 'testExplosion'
      } as ApiErrorResponse)
      const request = new DeleteApiRequestBuilder<string>('test').sendRequest()
      await expect(request).rejects.toEqual(new ApiError(400, 'testExplosion', 'The API has exploded!'))
    })

    it('with another status code than 400', async () => {
      expectFetch('/api/private/test', 401, { method: 'DELETE' }, {
        message: 'The API has exploded!',
        name: 'testExplosion'
      } as ApiErrorResponse)
      const request = new DeleteApiRequestBuilder<string>('test').sendRequest()
      await expect(request).rejects.toEqual(new ApiError(401, 'testExplosion', 'The API has exploded!'))
    })
  })
})
