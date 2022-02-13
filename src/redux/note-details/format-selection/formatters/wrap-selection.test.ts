/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { wrapSelection } from './wrap-selection'

describe('wrap selection', () => {
  it(`doesn't modify any line if no to-cursor is present`, () => {
    const actual = wrapSelection(
      'a\nb\nc',
      {
        from: 0
      },
      'before',
      'after'
    )

    expect(actual).toStrictEqual(['a\nb\nc', { from: 0 }])
  })

  it(`wraps the selected text in the same line`, () => {
    const actual = wrapSelection(
      'a\nb\nc',
      {
        from: 0,
        to: 1
      },
      'before',
      'after'
    )

    expect(actual).toStrictEqual(['beforeaafter\nb\nc', { from: 0, to: 12 }])
  })

  it(`wraps the selected text in different lines`, () => {
    const actual = wrapSelection(
      'a\nb\nc',
      {
        from: 0,
        to: 5
      },
      'before',
      'after'
    )

    expect(actual).toStrictEqual(['beforea\nb\ncafter', { from: 0, to: 16 }])
  })
})
