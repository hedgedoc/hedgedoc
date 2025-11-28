/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { listRepositoryPathContents } from './list-contents'

export interface GithubSyncTarget {
  owner: string
  repo: string
  branch: string
  path: string
}

const buildLastSyncedShaKey = (noteId?: string): string | null => {
  return noteId ? `hd2.sync.github.state.${noteId}` : null
}

interface StoredSyncShaPayload {
  sha: string | null
  savedAt: string
}

export interface StoredSyncSha {
  sha: string | null
  isKnown: boolean
}

export const loadTokenFromLocalStorage = (): string | null => {
  try {
    const raw = window.localStorage.getItem('hd2.sync.github.token')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { token?: string }
    return parsed.token ?? null
  } catch {
    return null
  }
}

export const loadTargetFromLocalStorage = (noteId: string | undefined): GithubSyncTarget | null => {
  if (!noteId) return null
  try {
    const raw = window.localStorage.getItem(`hd2.sync.github.target.${noteId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GithubSyncTarget
    if (!parsed?.owner || !parsed?.repo || !parsed?.branch || !parsed?.path) return null
    return parsed
  } catch {
    return null
  }
}

export const loadLastSyncedSha = (noteId: string | undefined): StoredSyncSha => {
  const key = buildLastSyncedShaKey(noteId)
  if (!key) {
    return { sha: null, isKnown: false }
  }
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return { sha: null, isKnown: false }
    }
    const parsed = JSON.parse(raw) as Partial<StoredSyncShaPayload>
    if (!parsed || !Object.prototype.hasOwnProperty.call(parsed, 'sha')) {
      return { sha: null, isKnown: false }
    }
    return { sha: parsed.sha ?? null, isKnown: true }
  } catch {
    return { sha: null, isKnown: false }
  }
}

export const saveLastSyncedSha = (noteId: string | undefined, sha: string | null): void => {
  const key = buildLastSyncedShaKey(noteId)
  if (!key) {
    return
  }
  try {
    const payload: StoredSyncShaPayload = {
      sha: sha ?? null,
      savedAt: new Date().toISOString()
    }
    window.localStorage.setItem(key, JSON.stringify(payload))
    window.dispatchEvent(new CustomEvent('hd2.sync.github.updated'))
  } catch {
    // ignore storage errors
  }
}

export const clearLastSyncedSha = (noteId: string | undefined): void => {
  const key = buildLastSyncedShaKey(noteId)
  if (!key) {
    return
  }
  try {
    window.localStorage.removeItem(key)
    window.dispatchEvent(new CustomEvent('hd2.sync.github.updated'))
  } catch {
    // ignore storage errors
  }
}

const base64ToUtf8 = (b64: string): string => {
  try {
    return decodeURIComponent(escape(window.atob(b64)))
  } catch {
    return window.atob(b64)
  }
}

const utf8ToBase64 = (text: string): string => {
  try {
    return window.btoa(unescape(encodeURIComponent(text)))
  } catch {
    return window.btoa(text)
  }
}

export interface GithubFileContent {
  content: string
  sha: string | null
}

/**
 * Retrieves file content (decoded) and sha on the given ref.
 * If the file doesn't exist, returns empty content and null sha.
 */
export const getFileContent = async (token: string, target: GithubSyncTarget): Promise<GithubFileContent> => {
  const entries = await listRepositoryPathContents(token, target.owner, target.repo, target.path, target.branch)
  // API returns a single object for file; our helper normalizes to array
  const file = entries.find((e: any) => e.type === 'file' && e.path === target.path) as any
  if (!file) {
    return { content: '', sha: null }
  }
  // Fetch full file content endpoint (returns content and sha)
  const response = await fetch(
    `https://api.github.com/repos/${target.owner}/${target.repo}/contents/${encodeURIComponent(target.path)
      .replace(/%2F/g, '/') }?ref=${encodeURIComponent(target.branch)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )
  if (!response.ok) {
    if (response.status === 404) {
      return { content: '', sha: null }
    }
    if (response.status === 401) {
      throw new Error('Invalid GitHub token provided')
    }
    throw new Error('Request to GitHub API failed')
  }
  const json = (await response.json()) as { content: string; sha: string }
  return {
    content: base64ToUtf8(json.content.replace(/\n/g, '')),
    sha: json.sha ?? null
  }
}

/**
 * Updates or creates the file with given content on the branch. Requires sha if file exists.
 */
export const putFileContent = async (
  token: string,
  target: GithubSyncTarget,
  content: string,
  currentSha: string | null
): Promise<string | null> => {
  const body = {
    message: `Update ${target.path} via HedgeDoc`,
    content: utf8ToBase64(content),
    branch: target.branch,
    ...(currentSha ? { sha: currentSha } : {})
  }
  const response = await fetch(
    `https://api.github.com/repos/${target.owner}/${target.repo}/contents/${encodeURIComponent(target.path)
      .replace(/%2F/g, '/') }`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  )
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid GitHub token provided')
    }
    throw new Error('Request to GitHub API failed')
  }
  const json = (await response.json()) as { content?: { sha?: string | null } }
  return json.content?.sha ?? null
}


