/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fetchGitlabSnippet } from './fetch-gitlab-snippet'

describe('fetchGitlabSnippet', () => {
  const mockResponse = (body: string, status = 200): Response => {
    return {
      ok: status >= 200 && status < 300,
      status,
      text: () => Promise.resolve(body)
    } as Response
  }

  beforeEach(() => {
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('fetches content through the API of a self-managed GitLab instance', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(mockResponse('first'))

    await expect(fetchGitlabSnippet('https://gitlab.example.com/-/snippets/42', '')).resolves.toBe('first')
    expect(global.fetch).toHaveBeenCalledWith('https://gitlab.example.com/api/v4/snippets/42/raw', { headers: {} })
  })

  it('uses the access token for raw content', async () => {
    jest.mocked(global.fetch).mockResolvedValueOnce(mockResponse('private'))

    await fetchGitlabSnippet('https://gitlab.com/-/snippets/42', 'secret')

    expect(global.fetch).toHaveBeenCalledWith('https://gitlab.com/api/v4/snippets/42/raw', {
      headers: { 'PRIVATE-TOKEN': 'secret' }
    })
  })

  it('rejects URLs without a numeric snippet ID', async () => {
    await expect(fetchGitlabSnippet('https://gitlab.com/-/snippets/not-an-id', '')).rejects.toThrow(
      'Enter a complete GitLab snippet URL'
    )
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
