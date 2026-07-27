/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

interface ParsedSnippetUrl {
  instanceOrigin: string
  snippetId: string
}

const parseSnippetUrl = (snippetUrl: string): ParsedSnippetUrl => {
  let url: URL
  try {
    url = new URL(snippetUrl)
  } catch {
    throw new Error('The GitLab snippet URL is invalid')
  }

  const pathParts = url.pathname.split('/').filter(Boolean)
  const snippetsIndex = pathParts.lastIndexOf('snippets')
  const snippetId = pathParts[snippetsIndex + 1]
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username !== '' ||
    url.password !== '' ||
    snippetsIndex === -1 ||
    !/^\d+$/.test(snippetId ?? '')
  ) {
    throw new Error('Enter a complete GitLab snippet URL')
  }
  return { instanceOrigin: url.origin, snippetId }
}

/**
 * Fetches the first file from a GitLab snippet.
 *
 * @param snippetUrl Public URL of the snippet.
 * @param token Optional GitLab access token.
 * @returns Content of the first file.
 * @throws Error If the URL or GitLab response is invalid, or a request fails.
 */
export const fetchGitlabSnippet = async (snippetUrl: string, token: string): Promise<string> => {
  const { instanceOrigin, snippetId } = parseSnippetUrl(snippetUrl)
  const headers: Record<string, string> = {}
  if (token !== '') {
    headers['PRIVATE-TOKEN'] = token
  }

  const response = await fetch(`${instanceOrigin}/api/v4/snippets/${encodeURIComponent(snippetId)}/raw`, { headers })
  if (!response.ok) {
    throw new Error(
      response.status === 401 ? 'The GitLab access token is invalid' : 'The snippet could not be retrieved'
    )
  }
  return response.text()
}
