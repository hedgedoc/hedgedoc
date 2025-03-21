/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { extractFirstHeading } from './extract-first-heading.js'
import { describe, expect, it } from '@jest/globals'
import { Document, Element, Text } from 'domhandler'

describe('extract first heading', () => {
  describe.each([1, 2, 3, 4, 5, 6])('h%d', (headlineIndex) => {
    it('extracts plain text', () => {
      const content = `headline${headlineIndex}`
      const headline = new Element(`h${headlineIndex}`, {}, [new Text(content)])
      const document = new Document([headline])
      expect(extractFirstHeading(document)).toBe(content)
    })

    it("doesn't extract heading-anchor", () => {
      const headline = new Element(`h${headlineIndex}`, {}, [
        new Element('a', { class: 'class1 heading-anchor class2' }, [
          new Text('invalid link content'),
        ]),
      ])
      const document = new Document([headline])
      expect(extractFirstHeading(document)).toBe('')
    })

    it('extracts nested texts', () => {
      const headline = new Element(`h${headlineIndex}`, {}, [
        new Element('a', {}, [
          new Text('Valid'),
          new Element('div', {}, [new Text('Text')]),
          new Text(`${headlineIndex}`),
        ]),
      ])
      const document = new Document([headline])
      expect(extractFirstHeading(document)).toBe(`ValidText${headlineIndex}`)
    })

    it('extracts image alt texts', () => {
      const headline = new Element(`h${headlineIndex}`, {}, [
        new Element('img', { alt: 'Image Alt' }),
      ])
      const document = new Document([headline])
      expect(extractFirstHeading(document)).toBe('Image Alt')
    })

    it('extracts only the first found headline', () => {
      const headline1 = new Element(`h${headlineIndex}`, {}, [
        new Text(`headline${headlineIndex}`),
      ])
      const headline2 = new Element(`h${headlineIndex}`, {}, [
        new Text('headline1'),
      ])
      const document = new Document([headline1, headline2])
      expect(extractFirstHeading(document)).toBe(`headline${headlineIndex}`)
    })
  })
})
