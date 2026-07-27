/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

interface GistFile {
  content?: string
  raw_url?: string
  truncated?: boolean
}

interface GistResponse {
  files?: Record<string, GistFile | null>
}

const parseGistId = (gistUrl: string): string => {
  let url: URL
  try {
    url = new URL(gistUrl)
  } catch {
    throw new Error('The Gist URL is invalid')
  }

  const pathParts = url.pathname.split('/').filter(Boolean)
  if (url.protocol !== 'https:' || url.hostname !== 'gist.github.com' || pathParts.length !== 2) {
    throw new Error('Enter a complete gist.github.com URL')
  }
  return pathParts[1]
}

/**
 * Fetches the first file from a GitHub Gist.
 *
 * @param gistUrl Public URL of the Gist.
 * @param token Optional GitHub access token.
 * @returns Content of the first file.
 * @throws Error If the URL or GitHub response is invalid, or the request fails.
 */
export const fetchGist = async (gistUrl: string, token: string): Promise<string> => {
  const gistId = parseGistId(gistUrl)
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  if (token !== '') {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId)}`, { headers })
  if (!response.ok) {
    throw new Error(
      response.status === 401
        ? token === ''
          ? 'An access token is required'
          : 'The GitHub access token is invalid'
        : 'The Gist could not be retrieved'
    )
  }

  const gist = (await response.json()) as GistResponse
  const firstFile = Object.values(gist.files ?? {}).find((file): file is GistFile => file !== null)
  if (!firstFile) {
    throw new Error('The Gist does not contain any files')
  }

  if (firstFile.truncated && firstFile.raw_url) {
    const rawResponse = await fetch(firstFile.raw_url)
    if (!rawResponse.ok) {
      throw new Error('The complete Gist file could not be retrieved')
    }
    return rawResponse.text()
  }
  if (typeof firstFile.content !== 'string') {
    throw new Error('The Gist response does not contain file content')
  }
  return firstFile.content
}
