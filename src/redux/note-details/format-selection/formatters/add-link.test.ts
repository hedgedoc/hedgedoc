/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { addLink } from './add-link'

describe('add link', () => {
  describe('without to-cursor', () => {
    it('inserts a link', () => {
      const actual = addLink('', { from: 0 }, '')
      expect(actual).toEqual(['[](https://)', { from: 0, to: 12 }])
    })

    it('inserts a link into a line', () => {
      const actual = addLink('aa', { from: 1 }, '')
      expect(actual).toEqual(['a[](https://)a', { from: 1, to: 13 }])
    })

    it('inserts a link with a prefix', () => {
      const actual = addLink('', { from: 0 }, 'prefix')
      expect(actual).toEqual(['prefix[](https://)', { from: 0, to: 18 }])
    })
  })

  describe('with a normal text selected', () => {
    it('wraps the selection', () => {
      const actual = addLink(
        'a',
        {
          from: 0,
          to: 1
        },
        ''
      )
      expect(actual).toEqual(['[a](https://)', { from: 0, to: 13 }])
    })

    it('wraps the selection inside of a line', () => {
      const actual = addLink('aba', { from: 1, to: 2 }, '')
      expect(actual).toEqual(['a[b](https://)a', { from: 1, to: 14 }])
    })

    it('wraps the selection with a prefix', () => {
      const actual = addLink('a', { from: 0, to: 1 }, 'prefix')
      expect(actual).toEqual(['prefix[a](https://)', { from: 0, to: 19 }])
    })

    it('wraps a multi line selection', () => {
      const actual = addLink('a\nb\nc', { from: 0, to: 5 }, '')
      expect(actual).toEqual(['[a\nb\nc](https://)', { from: 0, to: 17 }])
    })
  })

  describe('with a url selected', () => {
    it('wraps the selection', () => {
      const actual = addLink(
        'https://google.com',
        {
          from: 0,
          to: 18
        },
        ''
      )
      expect(actual).toEqual(['[](https://google.com)', { from: 0, to: 22 }])
    })

    it('wraps the selection with a prefix', () => {
      const actual = addLink(
        'https://google.com',
        {
          from: 0,
          to: 18
        },
        'prefix'
      )
      expect(actual).toEqual(['prefix[](https://google.com)', { from: 0, to: 28 }])
    })

    it(`wraps a multi line selection not as link`, () => {
      const actual = addLink('a\nhttps://google.com\nc', { from: 0, to: 22 }, '')
      expect(actual).toEqual(['[a\nhttps://google.com\nc](https://)', { from: 0, to: 34 }])
    })
  })
})
