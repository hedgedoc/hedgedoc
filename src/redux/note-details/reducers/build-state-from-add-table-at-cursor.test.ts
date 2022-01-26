/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { buildStateFromAddTableAtCursor } from './build-state-from-add-table-at-cursor'
import { initialState } from '../initial-state'

describe('build state from add table at cursor', () => {
  it('fails if number of rows is negative', () => {
    expect(() =>
      buildStateFromAddTableAtCursor(
        {
          ...initialState
        },
        -1,
        1
      )
    ).toThrow()
  })

  it('fails if number of columns is negative', () => {
    expect(() =>
      buildStateFromAddTableAtCursor(
        {
          ...initialState
        },
        1,
        -1
      )
    ).toThrow()
  })

  it('generates a table with the correct size', () => {
    const actual = buildStateFromAddTableAtCursor(
      {
        ...initialState,
        markdownContentLines: ['a', 'b', 'c'],
        markdownContent: 'a\nb\nc',
        selection: {
          from: {
            line: 1,
            character: 0
          }
        }
      },
      3,
      3
    )
    expect(actual.markdownContent).toEqual(
      'a\n\n|  # 1 |  # 2 |  # 3 |\n' +
        '| ---- | ---- | ---- |\n' +
        '| Text | Text | Text |\n' +
        '| Text | Text | Text |\n' +
        '| Text | Text | Text |b\n' +
        'c'
    )
  })
})
