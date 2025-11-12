/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Lists branch names for a given repository.
 *
 * GET https://api.github.com/repos/{owner}/{repo}/branches
 *
 * @param token GitHub PAT
 * @param owner Repository owner
 * @param repo Repository name
 */
export const listBranches = async (token: string, owner: string, repo: string): Promise<string[]> => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, {
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
    throw new Error('Request to GitHub API failed')
  }
  const json = (await response.json()) as Array<{ name: string }>
  return json.map((b) => b.name)
}


