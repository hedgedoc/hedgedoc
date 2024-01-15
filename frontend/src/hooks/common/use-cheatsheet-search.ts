/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from 'react'
import { create, insert, search } from '@orama/orama'
import { useAsync } from 'react-use'
import { Logger } from '../../utils/logger'

export interface CheatsheetSearchIndexEntry {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly example: string
  readonly extensionId: string
}

const logger = new Logger('Cheatsheet Search')

/**
 * Generate document search index and provide functions to search.
 *
 * @param entries The list of entries to build the search index from
 * @param searchTerm What to search for
 * @return An array of the search results
 */
export const useCheatsheetSearch = (
  entries: CheatsheetSearchIndexEntry[],
  searchTerm: string
): CheatsheetSearchIndexEntry[] => {
  const [results, setResults] = useState<CheatsheetSearchIndexEntry[]>([])

  const {
    value: searchIndex,
    loading: searchIndexLoading,
    error: searchIndexError
  } = useAsync(async () => {
    const db = await create({
      schema: {
        id: 'string',
        title: 'string',
        description: 'string',
        example: 'string',
        extensionId: 'string'
      } as const
    })
    const adds = entries.map((entry) => {
      logger.debug('Add to search entry:', entry)
      return insert(db, entry)
    })
    await Promise.all(adds)
    return db
  }, [entries])

  useEffect(() => {
    if (searchIndexLoading || searchIndexError !== undefined || searchIndex === undefined || searchTerm === '') {
      return setResults(entries)
    }
    search(searchIndex, {
      term: searchTerm,
      tolerance: 1,
      properties: ['title', 'description', 'example'],
      boost: {
        title: 3,
        description: 2,
        example: 1
      }
    })
      .then((results) => {
        setResults(results.hits.map((entry) => entry.document))
      })
      .catch((error) => {
        logger.error(error)
      })
  }, [entries, searchIndexError, searchIndexLoading, searchIndex, searchTerm])

  return results
}
