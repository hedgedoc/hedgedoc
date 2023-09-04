/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fetchMotd } from './fetch-motd'
import { Mock } from 'ts-mockery'

describe('fetch motd', () => {
  const motdUrl = '/public/motd.md'

  beforeEach(() => {
    window.localStorage.clear()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.resetModules()
  })
  beforeAll(() => {
    global.fetch = jest.fn()
  })

  const mockFetch = (
    responseText: string,
    lastModified: string | null,
    etag?: string | null
  ): jest.SpyInstance<Promise<Response>> => {
    return jest.spyOn(global, 'fetch').mockImplementation((url: RequestInfo | URL) => {
      if (url !== motdUrl) {
        return Promise.reject('wrong url')
      }
      return Promise.resolve(
        Mock.of<Response>({
          headers: Mock.of<Headers>({
            get: (name: string) => {
              return name === 'Last-Modified' ? lastModified : name === 'etag' ? etag ?? null : null
            }
          }),
          text: () => Promise.resolve(responseText),
          status: 200
        })
      )
    })
  }

  const mockFileNotFoundFetch = () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Mock.of<Response>({
          status: 500
        })
      )
    )
  }

  describe('date detection', () => {
    it('will return the last-modified value if available', async () => {
      mockFetch('mocked motd', 'yesterday-modified', null)
      const result = fetchMotd()
      await expect(result).resolves.toStrictEqual({
        motdText: 'mocked motd',
        lastModified: 'yesterday-modified'
      })
    })
    it('will return the etag if last-modified is not returned', async () => {
      mockFetch('mocked motd', null, 'yesterday-etag')
      const result = fetchMotd()
      await expect(result).resolves.toStrictEqual({
        motdText: 'mocked motd',
        lastModified: 'yesterday-etag'
      })
    })
    it('will prefer the last-modified header over the etag', async () => {
      mockFetch('mocked motd', 'yesterday-last', 'yesterday-etag')
      const result = fetchMotd()
      await expect(result).resolves.toStrictEqual({
        motdText: 'mocked motd',
        lastModified: 'yesterday-last'
      })
    })
    it('will return an empty value if neither the last-modified value nor the etag is returned', async () => {
      mockFetch('mocked motd', null, null)
      const result = fetchMotd()
      await expect(result).resolves.toStrictEqual({
        motdText: 'mocked motd',
        lastModified: null
      })
    })
  })

  it('can fetch a motd if no last modified value has been memorized', async () => {
    mockFetch('mocked motd', 'yesterday')
    const result = fetchMotd()
    await expect(result).resolves.toStrictEqual({
      motdText: 'mocked motd',
      lastModified: 'yesterday'
    })
  })

  it("can detect that the motd hasn't been updated and returns cached content", async () => {
    mockFetch('mocked motd', 'yesterday')
    window.localStorage.setItem('motd.lastModified', 'yesterday')
    window.localStorage.setItem('motd.content', 'mocked motd')
    const result = fetchMotd()
    await expect(result).resolves.toStrictEqual({
      motdText: 'mocked motd',
      lastModified: 'yesterday'
    })
  })

  it('can detect that the motd has been updated and updates cache', async () => {
    mockFetch('mocked motd', 'yesterday')
    window.localStorage.setItem('motd.content', 'old motd')
    window.localStorage.setItem('motd.lastModified', 'the day before yesterday')
    const result = fetchMotd()
    await expect(result).resolves.toStrictEqual({
      motdText: 'mocked motd',
      lastModified: 'yesterday'
    })
    expect(window.localStorage.getItem('motd.content')).toBe('mocked motd')
  })

  it("won't fetch a motd if no file was found", async () => {
    mockFileNotFoundFetch()
    const result = fetchMotd()
    await expect(result).resolves.toStrictEqual(undefined)
  })

  it("won't fetch a motd update if no file was found", async () => {
    mockFileNotFoundFetch()
    window.localStorage.setItem('motd.lastModified', 'the day before yesterday')
    const result = fetchMotd()
    await expect(result).resolves.toStrictEqual(undefined)
  })
})
