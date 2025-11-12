/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface GithubContentEntry {
  type: 'file' | 'dir' | 'symlink' | 'submodule'
  name: string
  path: string
}

/**
 * Lists contents of a repository path on a given ref (branch/commit).
 *
 * GET https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={ref}
 *
 * @param token GitHub PAT
 * @param owner Repository owner
 * @param repo Repository name
 * @param path Path within the repository ('' or folder path)
 * @param ref Branch or commit SHA
 */
export const listRepositoryPathContents = async (
  token: string,
  owner: string,
  repo: string,
  path: string,
  ref: string
): Promise<GithubContentEntry[]> => {
  const encodedPath = path ? encodeURIComponent(path).replace(/%2F/g, '/') : ''
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid GitHub token provided')
    }
    if (response.status === 404) {
      // Path may not exist on the branch; treat as empty
      return []
    }
    throw new Error('Request to GitHub API failed')
  }
  const json = (await response.json()) as GithubContentEntry | GithubContentEntry[]
  return Array.isArray(json) ? json : [json]
}


