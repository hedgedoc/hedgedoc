/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceSelection } from './replace-selection'
import type { ContentEdits } from './types/changes'

describe('replace selection', () => {
  it('inserts a text after the from-cursor if no to-cursor is present', () => {
    const actual = replaceSelection(
      {
        from: 2
      },
      'text2'
    )
    const expectedChanges: ContentEdits = [
      {
        from: 2,
        to: 2,
        insert: 'text2'
      }
    ]
    expect(actual).toEqual([expectedChanges, { from: 2, to: 7 }])
  })

  it('inserts a text if from-cursor and to-cursor are the same', () => {
    const actual = replaceSelection(
      {
        from: 2,
        to: 2
      },
      'text2'
    )
    const expectedChanges: ContentEdits = [
      {
        from: 2,
        to: 2,
        insert: 'text2'
      }
    ]
    expect(actual).toEqual([expectedChanges, { from: 2, to: 7 }])
  })

  it('replaces a single line text', () => {
    const actual = replaceSelection(
      {
        from: 7,
        to: 8
      },
      'text4'
    )
    const expectedChanges: ContentEdits = [
      {
        from: 7,
        to: 8,
        insert: 'text4'
      }
    ]
    expect(actual).toEqual([expectedChanges, { from: 7, to: 12 }])
  })

  it('replaces a multi line text', () => {
    const actual = replaceSelection(
      {
        from: 2,
        to: 15
      },
      'text4'
    )
    const expectedChanges: ContentEdits = [
      {
        from: 2,
        to: 15,
        insert: 'text4'
      }
    ]
    expect(actual).toEqual([expectedChanges, { from: 2, to: 7 }])
  })
})
