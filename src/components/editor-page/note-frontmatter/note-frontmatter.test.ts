/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import frontmatter from 'markdown-it-front-matter'
import { NoteFrontmatter, RawNoteFrontmatter } from './note-frontmatter'

describe('yaml frontmatter tests', () => {
  let raw: RawNoteFrontmatter | undefined
  let finished: NoteFrontmatter | undefined
  const md = new MarkdownIt('default', {
    html: true,
    breaks: true,
    langPrefix: '',
    typographer: true
  })
  md.use(frontmatter, (rawMeta: string) => {
    raw = yaml.load(rawMeta) as RawNoteFrontmatter
    finished = new NoteFrontmatter(raw)
  })

  // generate default YAMLMetadata
  md.render('---\n---')
  const defaultYAML = finished

  const testFrontmatter = (input: string, expectedRaw: Partial<RawNoteFrontmatter>, expectedFinished: Partial<NoteFrontmatter>) => {
    md.render(input)
    expect(raw)
      .not
      .toBe(undefined)
    expect(raw)
      .toEqual(expectedRaw)
    expect(finished)
      .not
      .toBe(undefined)
    expect(finished)
      .toEqual({
        ...defaultYAML,
        ...expectedFinished
      })
  }

  beforeEach(() => {
    raw = undefined
    finished = undefined
  })

  it('title only', () => {
    testFrontmatter(`---
    title: test
    ___
    `,
      {
        title: 'test'
      },
      {
        title: 'test'
      })
  })

  it('robots only', () => {
    testFrontmatter(`---
    robots: index, follow
    ___
    `,
      {
        robots: 'index, follow'
      },
      {
        robots: 'index, follow'
      })
  })

  it('tags only (old syntax)', () => {
    testFrontmatter(`---
    tags: test123, abc
    ___
    `,
      {
        tags: 'test123, abc'
      },
      {
        tags: ['test123', 'abc'],
        deprecatedTagsSyntax: true
      })
  })

  it('tags only', () => {
    testFrontmatter(`---
    tags:
      - test123
      - abc
    ___
    `,
      {
        tags: ['test123', 'abc']
      },
      {
        tags: ['test123', 'abc'],
        deprecatedTagsSyntax: false
      })
  })

  it('tags only (alternative syntax)', () => {
    testFrontmatter(`---
    tags: ['test123', 'abc']
    ___
    `,
      {
        tags: ['test123', 'abc']
      },
      {
        tags: ['test123', 'abc'],
        deprecatedTagsSyntax: false
      })
  })

  it('breaks only', () => {
    testFrontmatter(`---
    breaks: false
    ___
    `,
      {
        breaks: false
      },
      {
        breaks: false
      })
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

  it('opengraph nothing', () => {
    testFrontmatter(`---
    opengraph:
    ___
    `,
      {
        opengraph: null
      },
      {
        opengraph: new Map<string, string>()
      })
  })

  it('opengraph title only', () => {
    testFrontmatter(`---
    opengraph:
      title: Testtitle
    ___
    `,
      {
        opengraph: {
          title: 'Testtitle'
        }
      },
      {
        opengraph: new Map<string, string>(Object.entries({ title: 'Testtitle' }))
      })
  })

  it('opengraph more attributes', () => {
    testFrontmatter(`---
    opengraph:
      title: Testtitle
      image: https://dummyimage.com/48.png
      image:type: image/png
    ___
    `,
      {
        opengraph: {
          title: 'Testtitle',
          image: 'https://dummyimage.com/48.png',
          'image:type': 'image/png'
        }
      },
      {
        opengraph: new Map<string, string>(Object.entries({
          title: 'Testtitle',
          image: 'https://dummyimage.com/48.png',
          'image:type': 'image/png'
        }))
      })
  })
})
