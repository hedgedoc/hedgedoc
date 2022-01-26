/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { replaceSelection } from './replace-selection'

describe('replace selection', () => {
  it('inserts a text after the from-cursor if no to-cursor is present', () => {
    const actual = replaceSelection(
      ['text1'],
      {
        from: {
          line: 0,
          character: 2
        }
      },
      'text2'
    )
    expect(actual).toEqual(['tetext2xt1'])
  })

  it('inserts a text if from-cursor and to-cursor are the same', () => {
    const actual = replaceSelection(
      ['text1'],
      {
        from: {
          line: 0,
          character: 2
        },
        to: {
          line: 0,
          character: 2
        }
      },
      'text2'
    )
    expect(actual).toEqual(['tetext2xt1'])
  })

  it('replaces a single line text', () => {
    const actual = replaceSelection(
      ['text1', 'text2', 'text3'],
      {
        from: {
          line: 1,
          character: 1
        },
        to: {
          line: 1,
          character: 2
        }
      },
      'text4'
    )
    expect(actual).toEqual(['text1', 'ttext4xt2', 'text3'])
  })

  it('replaces a multi line text', () => {
    const actual = replaceSelection(
      ['text1', 'text2', 'text3'],
      {
        from: {
          line: 0,
          character: 2
        },
        to: {
          line: 2,
          character: 3
        }
      },
      'text4'
    )
    expect(actual).toEqual(['tetext4', 't3'])
  })
})
