/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { CheatsheetSearchIndexEntry } from './use-cheatsheet-search'
import { useCheatsheetSearch } from './use-cheatsheet-search'
import { renderHook, waitFor } from '@testing-library/react'

describe('useDocumentSearch', () => {
  const searchEntries: CheatsheetSearchIndexEntry[] = [
    {
      id: 'test1',
      extensionId: 'test1',
      title: 'title1',
      description: 'description1',
      example: 'example1'
    },
    {
      id: 'test2',
      extensionId: 'test2',
      title: 'title2 sub',
      description: 'description2',
      example: 'example2'
    },
    {
      id: 'test3',
      extensionId: 'test3',
      title: 'title3 sub',
      description: 'description3',
      example: 'example3'
    }
  ]

  it('returns all entries if no search term is given', async () => {
    const { result } = renderHook((searchTerm: string) => useCheatsheetSearch(searchEntries, searchTerm), {
      initialProps: ''
    })

    await waitFor(() => expect(result.current).toStrictEqual(searchEntries))
  })

  it('results no entries if nothing has been found', async () => {
    const { result } = renderHook((searchTerm: string) => useCheatsheetSearch(searchEntries, searchTerm), {
      initialProps: 'Foo'
    })

    await waitFor(() => expect(result.current).toHaveLength(0))
  })

  it('returns multiple entries if matching', async () => {
    const { result } = renderHook((searchTerm: string) => useCheatsheetSearch(searchEntries, searchTerm), {
      initialProps: 'sub'
    })

    await waitFor(() => expect(result.current).toHaveLength(2))
  })
})
