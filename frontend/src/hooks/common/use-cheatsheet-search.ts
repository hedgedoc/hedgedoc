/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useMemo, useState } from 'react'
import type { Orama, Results } from '@orama/orama'
import { create, insertMultiple, search } from '@orama/orama'

export interface CheatsheetSearchIndexEntry {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly example: string
  readonly extensionId: string
}

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

  const searchIndex = useMemo(() => {
    const db = create({
      schema: {
        id: 'string',
        title: 'string',
        description: 'string',
        example: 'string',
        extensionId: 'string'
      } as const
    })
    void insertMultiple(db, entries)
    return db as Orama<CheatsheetSearchIndexEntry>
  }, [entries])

  useEffect(() => {
    if (searchIndex === undefined || searchTerm === '') {
      return setResults(entries)
    }
    const rawResults = search(searchIndex, {
      term: searchTerm,
      tolerance: 1,
      properties: ['title', 'description', 'example'],
      boost: {
        title: 3,
        description: 2,
        example: 1
      },
      limit: entries.length
    }) as Results<CheatsheetSearchIndexEntry>
    const results = rawResults.hits.map((entry) => entry.document)
    setResults(results)
  }, [entries, searchIndex, searchTerm])

  return results
}
