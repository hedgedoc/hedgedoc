/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { prependLinesOfSelection } from './prepend-lines-of-selection'

describe('replace lines of selection', () => {
  it('replaces only the from-cursor line if no to-cursor is present', () => {
    const actual = prependLinesOfSelection(
      'a\nb\nc',
      {
        from: 2
      },
      (line, lineIndexInBlock) => `text_${lineIndexInBlock}_`
    )
    expect(actual).toStrictEqual(['a\ntext_0_b\nc', { from: 2, to: 10 }])
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
    expect(actual).toStrictEqual(['a\ntext_0_b\nc', { from: 2, to: 10 }])
  })

  it('replaces multiple lines', () => {
    const actual = prependLinesOfSelection(
      'a\nb\nc\nd\ne',
      {
        from: 2,
        to: 6
      },
      (line, lineIndexInBlock) => `text_${lineIndexInBlock}_`
    )
    expect(actual).toEqual(['a\ntext_0_b\ntext_1_c\ntext_2_d\ne', { from: 2, to: 28 }])
  })
})
