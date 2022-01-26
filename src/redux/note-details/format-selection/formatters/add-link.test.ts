/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addLink } from './add-link'

describe('add link', () => {
  describe('without to-cursor', () => {
    it('inserts a link', () => {
      const actual = addLink([''], { from: { line: 0, character: 0 } }, '')
      expect(actual).toEqual(['[](https://)'])
    })

    it('inserts a link into a line', () => {
      const actual = addLink(['aa'], { from: { line: 0, character: 1 } }, '')
      expect(actual).toEqual(['a[](https://)a'])
    })

    it('inserts a link with a prefix', () => {
      const actual = addLink([''], { from: { line: 0, character: 0 } }, 'prefix')
      expect(actual).toEqual(['prefix[](https://)'])
    })
  })

  describe('with a normal text selected', () => {
    it('wraps the selection', () => {
      const actual = addLink(
        ['a'],
        {
          from: { line: 0, character: 0 },
          to: {
            line: 0,
            character: 1
          }
        },
        ''
      )
      expect(actual).toEqual(['[a](https://)'])
    })

    it('wraps the selection inside of a line', () => {
      const actual = addLink(['aba'], { from: { line: 0, character: 1 }, to: { line: 0, character: 2 } }, '')
      expect(actual).toEqual(['a[b](https://)a'])
    })

    it('wraps the selection with a prefix', () => {
      const actual = addLink(['a'], { from: { line: 0, character: 0 }, to: { line: 0, character: 1 } }, 'prefix')
      expect(actual).toEqual(['prefix[a](https://)'])
    })

    it('wraps a multi line selection', () => {
      const actual = addLink(['a', 'b', 'c'], { from: { line: 0, character: 0 }, to: { line: 2, character: 1 } }, '')
      expect(actual).toEqual(['[a', 'b', 'c](https://)'])
    })
  })

  describe('with a url selected', () => {
    it('wraps the selection', () => {
      const actual = addLink(
        ['https://google.com'],
        {
          from: { line: 0, character: 0 },
          to: {
            line: 0,
            character: 18
          }
        },
        ''
      )
      expect(actual).toEqual(['[](https://google.com)'])
    })

    it('wraps the selection with a prefix', () => {
      const actual = addLink(
        ['https://google.com'],
        {
          from: { line: 0, character: 0 },
          to: {
            line: 0,
            character: 18
          }
        },
        'prefix'
      )
      expect(actual).toEqual(['prefix[](https://google.com)'])
    })

    it(`wraps a multi line selection not as link`, () => {
      const actual = addLink(
        ['a', 'https://google.com', 'c'],
        { from: { line: 0, character: 0 }, to: { line: 2, character: 1 } },
        ''
      )
      expect(actual).toEqual(['[a', 'https://google.com', 'c](https://)'])
    })
  })
})
