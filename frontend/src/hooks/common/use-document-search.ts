/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { IndexOptionsForDocumentSearch, Id, SimpleDocumentSearchResultSetUnit } from 'flexsearch-ts'
import { Document } from 'flexsearch-ts'
import { useEffect, useMemo, useState } from 'react'

export interface SearchIndexEntry {
  id: Id
}

/**
 * Generate document search index and provide functions to search.
 *
 * @param entries The list of entries to built the search index from
 * @param options Options for the search index
 * @param searchTerm What to search for
 * @return An array of the search results
 */
export const useDocumentSearch = <T extends SearchIndexEntry>(
  entries: Array<T>,
  options: IndexOptionsForDocumentSearch<T>,
  searchTerm: string
): SimpleDocumentSearchResultSetUnit[] => {
  const [results, setResults] = useState<SimpleDocumentSearchResultSetUnit[]>([])
  const searchIndex = useMemo(() => {
    const index = new Document<T>({
      tokenize: 'full',
      ...options
    })
    entries.forEach((entry) => {
      index.add(entry)
    })
    return index
  }, [entries, options])
  useEffect(() => {
    setResults(searchIndex.search(searchTerm))
  }, [searchIndex, searchTerm])

  return results
}
