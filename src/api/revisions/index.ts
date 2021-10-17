/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Cache } from '../../components/common/cache/cache'
import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'
import type { Revision, RevisionListEntry } from './types'

const revisionCache = new Cache<string, Revision>(3600)

export const getRevision = async (noteId: string, timestamp: number): Promise<Revision> => {
  const cacheKey = `${noteId}:${timestamp}`
  if (revisionCache.has(cacheKey)) {
    return revisionCache.get(cacheKey)
  }
  const response = await fetch(getApiUrl() + `notes/${noteId}/revisions/${timestamp}`, {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  const revisionData = (await response.json()) as Revision
  revisionCache.put(cacheKey, revisionData)
  return revisionData
}

export const getAllRevisions = async (noteId: string): Promise<RevisionListEntry[]> => {
  // TODO Change 'revisions-list' to 'revisions' as soon as the backend is ready to serve some data!
  const response = await fetch(getApiUrl() + `notes/${noteId}/revisions-list`, {
    ...defaultFetchConfig
  })
  expectResponseCode(response)
  return (await response.json()) as Promise<RevisionListEntry[]>
}
