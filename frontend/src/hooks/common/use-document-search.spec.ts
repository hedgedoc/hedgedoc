/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { SearchIndexEntry } from './use-document-search'
import { useDocumentSearch } from './use-document-search'
import { renderHook } from '@testing-library/react'

describe('useDocumentSearch', () => {
  interface TestSearchIndexEntry extends SearchIndexEntry {
    name: string
    text: string
  }

  const searchOptions = {
    document: {
      id: 'id',
      field: ['name', 'text']
    }
  }
  const searchEntries: TestSearchIndexEntry[] = [
    {
      id: 1,
      name: 'Foo',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean fermentum odio in bibendum venenatis. Cras aliquet ultrices finibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    },
    {
      id: 2,
      name: 'Bar',
      text: 'Vivamus sed mauris eget magna sodales blandit. Aliquam tincidunt nunc et sapien scelerisque placerat. Pellentesque a orci ac risus molestie suscipit id vel arcu.'
    },
    {
      id: 3,
      name: 'Cras',
      text: 'Cras consectetur sit amet tortor eget sollicitudin. Ut convallis orci ipsum, eget dignissim nibh dignissim eget. Nunc commodo est neque, eget venenatis urna condimentum eget. Suspendisse dapibus ligula et enim venenatis hendrerit. '
    }
  ]
  it('results get populated', () => {
    const { result, rerender } = renderHook(
      (searchTerm: string) => useDocumentSearch(searchEntries, searchOptions, searchTerm),
      {
        initialProps: ''
      }
    )
    rerender('Foo')

    expect(result.current).toHaveLength(1)
    expect(result.current[0]).toEqual({ field: 'name', result: [1] })
  })
  it('finds in multiple fields', () => {
    const { result, rerender } = renderHook(
      (searchTerm: string) => useDocumentSearch(searchEntries, searchOptions, searchTerm),
      {
        initialProps: ''
      }
    )
    rerender('Cras')

    expect(result.current).toHaveLength(2)
    expect(result.current[0]).toEqual({ field: 'name', result: [3] })
    expect(result.current[1]).toEqual({ field: 'text', result: [3, 1] })
  })
})
