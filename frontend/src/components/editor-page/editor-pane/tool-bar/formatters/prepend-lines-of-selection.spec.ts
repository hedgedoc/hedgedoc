/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { prependLinesOfSelection } from './prepend-lines-of-selection'
import type { ContentEdits } from './types/changes'

describe('replace lines of selection', () => {
  it('replaces only the from-cursor line if no to-cursor is present', () => {
    const actual = prependLinesOfSelection(
      'a\nb\nc',
      {
        from: 2
      },
      (line, lineIndexInBlock) => `text_${lineIndexInBlock}_`
    )
    const expectedChanges: ContentEdits = [
      {
        from: 2,
        to: 2,
        insert: 'text_0_'
      }
    ]
    expect(actual).toStrictEqual([expectedChanges, { from: 2, to: 10 }])
  })

  it('inserts a line prepend if no content is there', () => {
    const actual = prependLinesOfSelection(
      '',
      {
        from: 0
      },
      (line, lineIndexInBlock) => `text_${lineIndexInBlock}_`
    )
    const expectedChanges: ContentEdits = [
      {
        from: 0,
        to: 0,
        insert: 'text_0_'
      }
    ]
    expect(actual).toStrictEqual([expectedChanges, { from: 0, to: 7 }])
  })

  it('replaces only one line if from-cursor and to-cursor are in the same line', () => {
    const actual = prependLinesOfSelection(
      'a\nb\nc',
      {
        from: 2,
        to: 2
      },
      (line, lineIndexInBlock) => `text_${lineIndexInBlock}_`
    )
    const expectedChanges: ContentEdits = [
      {
        from: 2,
        to: 2,
        insert: 'text_0_'
      }
    ]
    expect(actual).toStrictEqual([expectedChanges, { from: 2, to: 10 }])
  })

  it('replaces multiple lines', () => {
    const actual = prependLinesOfSelection(
      'a\nb\nc\nd\ne',
      {
        from: 2,
        to: 6
      },
      (line, lineIndexInBlock) => `${lineIndexInBlock} `
    )
    const expectedChanges: ContentEdits = [
      {
        from: 2,
        to: 2,
        insert: '0 '
      },
      {
        from: 4,
        to: 4,
        insert: '1 '
      },
      {
        from: 6,
        to: 6,
        insert: '2 '
      }
    ]
    expect(actual).toEqual([expectedChanges, { from: 2, to: 13 }])
  })
})
