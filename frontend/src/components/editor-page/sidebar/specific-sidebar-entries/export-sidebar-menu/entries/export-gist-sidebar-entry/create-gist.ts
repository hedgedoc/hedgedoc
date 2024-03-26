/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Creates a gist on GitHub with the given content.
 *
 * @param token The GitHub personal access token to use
 * @param content The content of the gist
 * @param description The description of the gist
 * @param fileName The (generated) file name of the note
 * @param isPublic Whether the gist should be public
 * @return The URL of the created gist
 */
export const createGist = async (
  token: string,
  content: string,
  description: string,
  fileName: string,
  isPublic: boolean
): Promise<string> => {
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: description,
      public: isPublic,
      files: {
        [fileName]: { content }
      }
    })
  })
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid GitHub token provided')
    }
    throw new Error('Request to GitHub API failed')
  }
  const json = (await response.json()) as { html_url: string }
  if (!json.html_url) {
    throw new Error('Invalid response from GitHub API')
  }
  return json.html_url
}
