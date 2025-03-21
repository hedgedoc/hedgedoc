/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { parseTags } from './parse-tags.js'
import { expect, it, describe } from '@jest/globals'

describe('parse tags', () => {
  it('converts comma separated string tags into string list', () => {
    expect(parseTags('a,b,c,d,e,f')).toStrictEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
    ])
  })

  it('accepts a string list as tags', () => {
    expect(parseTags(['a', 'b', ' c', 'd ', 'e', 'f'])).toStrictEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
    ])
  })
})
