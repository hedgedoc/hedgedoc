/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fetchGist } from './fetch-gist'

describe('fetchGist', () => {
  const mockResponse = (body: string, status = 200): Response => {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(JSON.parse(body) as unknown),
      text: () => Promise.resolve(body)
    } as Response
  }

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('fetches the first file anonymously', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(
      mockResponse(
        JSON.stringify({
          files: {
            'first.md': { content: 'first' },
            'second.md': { content: 'second' }
          }
        })
      )
    )

    await expect(fetchGist('https://gist.github.com/user/abcdef', '')).resolves.toBe('first')
    expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/gists/abcdef', {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
  })

  it('uses the access token when provided', async () => {
    jest
      .mocked(global.fetch)
      .mockResolvedValueOnce(mockResponse(JSON.stringify({ files: { 'note.md': { content: 'private' } } })))

    await fetchGist('https://gist.github.com/user/abcdef', 'secret')

    expect(global.fetch).toHaveBeenCalledWith('https://api.github.com/gists/abcdef', {
      headers: expect.objectContaining({ Authorization: 'Bearer secret' })
    })
  })

  it('retrieves complete content for a truncated first file', async () => {
    jest
      .mocked(global.fetch)
      .mockResolvedValueOnce(
        mockResponse(
          JSON.stringify({
            files: {
              'note.md': { content: 'partial', truncated: true, raw_url: 'https://gist.githubusercontent.com/raw' }
            }
          })
        )
      )
      .mockResolvedValueOnce(mockResponse('complete'))

    await expect(fetchGist('https://gist.github.com/user/abcdef', '')).resolves.toBe('complete')
    expect(global.fetch).toHaveBeenLastCalledWith('https://gist.githubusercontent.com/raw')
  })

  it('rejects non-Gist URLs', async () => {
    await expect(fetchGist('https://example.com/user/abcdef', '')).rejects.toThrow(
      'Enter a complete gist.github.com URL'
    )
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
