/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export interface GithubRepository {
  id: number
  full_name: string
  private: boolean
  default_branch: string
  owner: {
    login: string
    type?: string
  }
  name: string
}

/**
 * Lists repositories accessible by the authenticated user.
 *
 * Uses the GitHub REST API v3 endpoint:
 * GET https://api.github.com/user/repos
 *
 * @param token The GitHub personal access token to use
 * @returns A list of repositories
 */
export const listRepositories = async (token: string): Promise<GithubRepository[]> => {
  const response = await fetch(
    'https://api.github.com/user/repos?per_page=100&sort=updated&visibility=all&affiliation=owner,collaborator,organization_member',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid GitHub token provided')
    }
    throw new Error('Request to GitHub API failed')
  }
  const json = (await response.json()) as GithubRepository[]
  return json
}


