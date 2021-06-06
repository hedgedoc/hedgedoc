/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import frontmatter from 'markdown-it-front-matter'
import { NoteFrontmatter, RawNoteFrontmatter } from './note-frontmatter'

describe('yaml frontmatter', () => {
  const testFrontmatter = (input: string): NoteFrontmatter => {
    let processedFrontmatter: NoteFrontmatter | undefined = undefined
    const md = new MarkdownIt('default', {
      html: true,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    md.use(frontmatter, (rawMeta: string) => {
      const parsedFrontmatter = yaml.load(rawMeta) as RawNoteFrontmatter | undefined
      expect(parsedFrontmatter).not.toBe(undefined)
      if (parsedFrontmatter === undefined) {
        fail('Parsed frontmatter is undefined')
      }
      processedFrontmatter = new NoteFrontmatter(parsedFrontmatter)
    })

    md.render(input)

    if (processedFrontmatter === undefined) {
      fail('NoteFrontmatter is undefined')
    }

    return processedFrontmatter
  }

  it('should parse "title"', () => {
    const noteFrontmatter = testFrontmatter(`---
    title: test
    ___
    `)

    expect(noteFrontmatter.title).toEqual('test')
  })

  it('should parse "robots"', () => {
    const noteFrontmatter = testFrontmatter(`---
    robots: index, follow
    ___
    `)

    expect(noteFrontmatter.robots).toEqual('index, follow')
  })

  it('should parse the deprecated tags syntax', () => {
    const noteFrontmatter = testFrontmatter(`---
    tags: test123, abc
    ___
    `)

    expect(noteFrontmatter.tags).toEqual(['test123', 'abc'])
    expect(noteFrontmatter.deprecatedTagsSyntax).toEqual(true)
  })

  it('should parse the tags list syntax', () => {
    const noteFrontmatter = testFrontmatter(`---
    tags:
      - test123
      - abc
    ___
    `)

    expect(noteFrontmatter.tags).toEqual(['test123', 'abc'])
    expect(noteFrontmatter.deprecatedTagsSyntax).toEqual(false)
  })

  it('should parse the tag inline-list syntax', () => {
    const noteFrontmatter = testFrontmatter(`---
    tags: ['test123', 'abc']
    ___
    `)

    expect(noteFrontmatter.tags).toEqual(['test123', 'abc'])
    expect(noteFrontmatter.deprecatedTagsSyntax).toEqual(false)
  })

  it('should parse "breaks"', () => {
    const noteFrontmatter = testFrontmatter(`---
    breaks: false
    ___
    `)

    expect(noteFrontmatter.breaks).toEqual(false)
  })

  /*
   it('slideOptions nothing', () => {
   testFrontmatter(`---
   slideOptions:
   ___
   `,
   {
   slideOptions: null
   },
   {
   slideOptions: {
   theme: 'white',
   transition: 'none'
   }
   })
   })

   it('slideOptions.theme only', () => {
   testFrontmatter(`---
   slideOptions:
   theme: sky
   ___
   `,
   {
   slideOptions: {
   theme: 'sky',
   transition: undefined
   }
   },
   {
   slideOptions: {
   theme: 'sky',
   transition: 'none'
   }
   })
   })

   it('slideOptions full', () => {
   testFrontmatter(`---
   slideOptions:
   transition: zoom
   theme: sky
   ___
   `,
   {
   slideOptions: {
   theme: 'sky',
   transition: 'zoom'
   }
   },
   {
   slideOptions: {
   theme: 'sky',
   transition: 'zoom'
   }
   })
   })
   */

  it('should parse an empty opengraph object', () => {
    const noteFrontmatter = testFrontmatter(`---
    opengraph:
    ___
    `)

    expect(noteFrontmatter.opengraph).toEqual(new Map<string, string>())
  })

  it('should parse an opengraph title', () => {
    const noteFrontmatter = testFrontmatter(`---
    opengraph:
      title: Testtitle
    ___
    `)

    expect(noteFrontmatter.opengraph.get('title')).toEqual('Testtitle')
  })

  it('should opengraph values', () => {
    const noteFrontmatter = testFrontmatter(`---
    opengraph:
      title: Testtitle
      image: https://dummyimage.com/48.png
      image:type: image/png
    ___
    `)

    expect(noteFrontmatter.opengraph.get('title')).toEqual('Testtitle')
    expect(noteFrontmatter.opengraph.get('image')).toEqual('https://dummyimage.com/48.png')
    expect(noteFrontmatter.opengraph.get('image:type')).toEqual('image/png')
  })
})
