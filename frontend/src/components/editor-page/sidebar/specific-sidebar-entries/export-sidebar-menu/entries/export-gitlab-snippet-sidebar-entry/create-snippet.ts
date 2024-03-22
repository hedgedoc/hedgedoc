/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum GitlabSnippetVisibility {
  PRIVATE = 'private',
  INTERNAL = 'internal',
  PUBLIC = 'public'
}

/**
 * Creates a snippet on a GitLab instance with the given content.
 *
 * @param instanceUrl The URL of the GitLab instance
 * @param token The GitLab access token to use
 * @param content The content of the snippet
 * @param title The title of the snippet
 * @param description The description of the gist
 * @param fileName The (generated) file name of the note
 * @param visibility The visibility level of the snippet
 * @return The URL of the created snippet
 */
export const createSnippet = async (
  instanceUrl: string,
  token: string,
  content: string,
  title: string,
  description: string,
  fileName: string,
  visibility: GitlabSnippetVisibility
): Promise<string> => {
  const cleanedInstanceUrl = instanceUrl.endsWith('/') ? instanceUrl.slice(0, -1) : instanceUrl

  const response = await fetch(`${cleanedInstanceUrl}/api/v4/snippets`, {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title,
      description: description,
      visibility: visibility,
      files: [
        {
          content: content,
          file_path: fileName
        }
      ]
    })
  })
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid GitLab access token provided')
    }
    throw new Error('Request to GitLab API failed')
  }
  const json = (await response.json()) as { web_url: string }
  if (!json.web_url) {
    throw new Error('Invalid response from GitLab API')
  }
  return json.web_url
}
