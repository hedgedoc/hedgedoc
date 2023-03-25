/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentEdits } from './types/changes'
import { wrapSelection } from './wrap-selection'

describe('wrap selection', () => {
  it(`doesn't modify any line if no to-cursor is present`, () => {
    const actual = wrapSelection(
      {
        from: 0
      },
      'before',
      'after'
    )

    expect(actual).toStrictEqual([[], { from: 0 }])
  })

  it(`wraps the selected text in the same line`, () => {
    const actual = wrapSelection(
      {
        from: 0,
        to: 1
      },
      'before',
      'after'
    )
    const expectedChanges: ContentEdits = [
      {
        from: 0,
        to: 0,
        insert: 'before'
      },
      {
        from: 1,
        to: 1,
        insert: 'after'
      }
    ]

    expect(actual).toStrictEqual([expectedChanges, { from: 0, to: 12 }])
  })

  it(`wraps the selected text in different lines`, () => {
    const actual = wrapSelection(
      {
        from: 0,
        to: 5
      },
      'before',
      'after'
    )

    const expectedChanges: ContentEdits = [
      {
        from: 0,
        to: 0,
        insert: 'before'
      },
      {
        from: 5,
        to: 5,
        insert: 'after'
      }
    ]

    expect(actual).toStrictEqual([expectedChanges, { from: 0, to: 16 }])
  })
})
