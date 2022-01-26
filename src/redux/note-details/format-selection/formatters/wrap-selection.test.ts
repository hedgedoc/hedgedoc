/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { wrapSelection } from './wrap-selection'

describe('wrap selection', () => {
  it(`doesn't modify any line if no to-cursor is present`, () => {
    const actual = wrapSelection(
      ['a', 'b', 'c'],
      {
        from: {
          line: 0,
          character: 0
        }
      },
      'before',
      'after'
    )

    expect(actual).toEqual(['a', 'b', 'c'])
  })

  it(`wraps the selected text in the same line`, () => {
    const actual = wrapSelection(
      ['a', 'b', 'c'],
      {
        from: {
          line: 0,
          character: 0
        },
        to: {
          line: 0,
          character: 1
        }
      },
      'before',
      'after'
    )

    expect(actual).toEqual(['beforeaafter', 'b', 'c'])
  })

  it(`wraps the selected text in different lines`, () => {
    const actual = wrapSelection(
      ['a', 'b', 'c'],
      {
        from: {
          line: 0,
          character: 0
        },
        to: {
          line: 2,
          character: 1
        }
      },
      'before',
      'after'
    )

    expect(actual).toEqual(['beforea', 'b', 'cafter'])
  })
})
