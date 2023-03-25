/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { calculateLineStartIndexes } from './calculate-line-start-indexes'

describe('calculateLineStartIndexes', () => {
  it('works with an empty list', () => {
    expect(calculateLineStartIndexes([])).toEqual([])
  })
  it('works with an non empty list', () => {
    expect(calculateLineStartIndexes(['a', 'bc', 'def', 'ghij', 'klmno', 'pqrstu', 'vwxyz'])).toEqual([
      0, 2, 5, 9, 14, 20, 27
    ])
  })
  it('works with an non empty list with empty lines', () => {
    expect(calculateLineStartIndexes(['', '', ''])).toEqual([0, 1, 2])
  })
})
