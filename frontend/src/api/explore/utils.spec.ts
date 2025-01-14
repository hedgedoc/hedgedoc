/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteType, SortMode } from '@hedgedoc/commons'
import { createURLSearchParams } from './utils'

describe('createURLSearchParams', () => {
  it('only sort is defined', () => {
    const sort = SortMode.TITLE_ASC
    const result = createURLSearchParams(sort, null, null, 1)
    expect(result).toStrictEqual('sort=title_asc&page=1')
  })
  it('sort and search are defined', () => {
    const sort = SortMode.TITLE_ASC
    const search = 'test'
    const result = createURLSearchParams(sort, search, null, 2)
    expect(result).toStrictEqual('sort=title_asc&page=2&search=test')
  })
  it('sort and type are defined', () => {
    const sort = SortMode.TITLE_ASC
    const type = NoteType.DOCUMENT
    const result = createURLSearchParams(sort, null, type, 3)
    expect(result).toStrictEqual('sort=title_asc&page=3&type=document')
  })
  it('everything is defined', () => {
    const sort = SortMode.TITLE_ASC
    const search = 'test'
    const type = NoteType.DOCUMENT
    const result = createURLSearchParams(sort, search, type, 4)
    expect(result).toStrictEqual('sort=title_asc&page=4&search=test&type=document')
  })
})
