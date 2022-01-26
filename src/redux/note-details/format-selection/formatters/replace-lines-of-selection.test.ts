/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { replaceLinesOfSelection } from './replace-lines-of-selection'

describe('replace lines of selection', () => {
  it('replaces only the from-cursor line if no to-cursor is present', () => {
    const actual = replaceLinesOfSelection(
      ['a', 'b', 'c'],
      {
        from: {
          line: 1,
          character: 123
        }
      },
      (line, lineIndexInBlock) => `text_${line}_${lineIndexInBlock}`
    )
    expect(actual).toEqual(['a', 'text_b_0', 'c'])
  })

  it('replaces only one line if from-cursor and to-cursor are in the same line', () => {
    const actual = replaceLinesOfSelection(
      ['a', 'b', 'c'],
      {
        from: {
          line: 1,
          character: 12
        },
        to: {
          line: 1,
          character: 34
        }
      },
      (line, lineIndexInBlock) => `text_${line}_${lineIndexInBlock}`
    )
    expect(actual).toEqual(['a', 'text_b_0', 'c'])
  })

  it('replaces multiple lines', () => {
    const actual = replaceLinesOfSelection(
      ['a', 'b', 'c', 'd', 'e'],
      {
        from: {
          line: 1,
          character: 1
        },
        to: {
          line: 3,
          character: 1
        }
      },
      (line, lineIndexInBlock) => `text_${line}_${lineIndexInBlock}`
    )
    expect(actual).toEqual(['a', 'text_b_0', 'text_c_1', 'text_d_2', 'e'])
  })
})
