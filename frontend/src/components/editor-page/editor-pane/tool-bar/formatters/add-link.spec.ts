/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { addLink } from './add-link'
import type { ContentEdits } from './types/changes'

describe('add link', () => {
  describe('without to-cursor', () => {
    it('inserts a link', () => {
      const actual = addLink('', { from: 0 }, '')
      const expectedChanges: ContentEdits = [
        {
          from: 0,
          to: 0,
          insert: '[](https://)'
        }
      ]
      expect(actual).toEqual([expectedChanges, { from: 0, to: 12 }])
    })

    it('inserts a link into a line', () => {
      const actual = addLink('aa', { from: 1 }, '')
      const expectedChanges: ContentEdits = [
        {
          from: 1,
          to: 1,
          insert: '[](https://)'
        }
      ]
      expect(actual).toEqual([expectedChanges, { from: 1, to: 13 }])
    })

    it('inserts a link with a prefix', () => {
      const actual = addLink('', { from: 0 }, 'prefix')
      const expectedChanges: ContentEdits = [
        {
          from: 0,
          to: 0,
          insert: 'prefix[](https://)'
        }
      ]
      expect(actual).toEqual([expectedChanges, { from: 0, to: 18 }])
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
      const expectedChanges: ContentEdits = [
        {
          from: 0,
          to: 1,
          insert: '[a](https://)'
        }
      ]
      expect(actual).toEqual([expectedChanges, { from: 0, to: 13 }])
    })

    it('wraps the selection inside of a line', () => {
      const actual = addLink('aba', { from: 1, to: 2 }, '')
      const expectedChanges: ContentEdits = [
        {
          from: 1,
          to: 2,
          insert: '[b](https://)'
        }
      ]
      expect(actual).toEqual([expectedChanges, { from: 1, to: 14 }])
    })

    it('wraps the selection with a prefix', () => {
      const actual = addLink('a', { from: 0, to: 1 }, 'prefix')
      const expectedChanges: ContentEdits = [
        {
          from: 0,
          to: 1,
          insert: 'prefix[a](https://)'
        }
      ]
      expect(actual).toEqual([expectedChanges, { from: 0, to: 19 }])
    })

    it('wraps a multi line selection', () => {
      const actual = addLink('a\nb\nc', { from: 0, to: 5 }, '')
      const expectedChanges: ContentEdits = [
        {
          from: 0,
          to: 5,
          insert: '[a\nb\nc](https://)'
        }
      ]
      expect(actual).toEqual([expectedChanges, { from: 0, to: 17 }])
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
      const expectedChanges: ContentEdits = [
        {
          from: 0,
          to: 18,
          insert: '[](https://google.com)'
        }
      ]
      expect(actual).toEqual([expectedChanges, { from: 0, to: 22 }])
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
      const expectedChanges: ContentEdits = [
        {
          from: 0,
          to: 18,
          insert: 'prefix[](https://google.com)'
        }
      ]
      expect(actual).toEqual([expectedChanges, { from: 0, to: 28 }])
    })

    it(`wraps a multi line selection not as link`, () => {
      const actual = addLink('a\nhttps://google.com\nc', { from: 0, to: 22 }, '')
      const expectedChanges: ContentEdits = [
        {
          from: 0,
          to: 22,
          insert: '[a\nhttps://google.com\nc](https://)'
        }
      ]
      expect(actual).toEqual([expectedChanges, { from: 0, to: 34 }])
    })
  })
})
