/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createNoteFrontmatterFromYaml } from './parser'

describe('yaml frontmatter', () => {
  it('should parse "title"', () => {
    const noteFrontmatter = createNoteFrontmatterFromYaml('title: test')
    expect(noteFrontmatter.title).toEqual('test')
  })

  it('should parse "robots"', () => {
    const noteFrontmatter = createNoteFrontmatterFromYaml('robots: index, follow')
    expect(noteFrontmatter.robots).toEqual('index, follow')
  })

  it('should parse the deprecated tags syntax', () => {
    const noteFrontmatter = createNoteFrontmatterFromYaml('tags: test123, abc')
    expect(noteFrontmatter.tags).toEqual(['test123', 'abc'])
  })

  it('should parse the tags list syntax', () => {
    const noteFrontmatter = createNoteFrontmatterFromYaml(`tags:
      - test123
      - abc
    `)
    expect(noteFrontmatter.tags).toEqual(['test123', 'abc'])
  })

  it('should parse the tag inline-list syntax', () => {
    const noteFrontmatter = createNoteFrontmatterFromYaml("tags: ['test123', 'abc']")
    expect(noteFrontmatter.tags).toEqual(['test123', 'abc'])
  })

  it('should parse "breaks"', () => {
    const noteFrontmatter = createNoteFrontmatterFromYaml('breaks: false')
    expect(noteFrontmatter.newlinesAreBreaks).toEqual(false)
  })

  it('should parse an empty opengraph object', () => {
    const noteFrontmatter = createNoteFrontmatterFromYaml('opengraph:')
    expect(noteFrontmatter.opengraph).toEqual({})
  })

  it('should parse an opengraph title', () => {
    const noteFrontmatter = createNoteFrontmatterFromYaml(`opengraph:
      title: Testtitle
    `)
    expect(noteFrontmatter.opengraph.title).toEqual('Testtitle')
  })

  it('should parse multiple opengraph values', () => {
    const noteFrontmatter = createNoteFrontmatterFromYaml(`opengraph:
      title: Testtitle
      image: https://dummyimage.com/48.png
      image:type: image/png
    `)
    expect(noteFrontmatter.opengraph.title).toEqual('Testtitle')
    expect(noteFrontmatter.opengraph.image).toEqual('https://dummyimage.com/48.png')
    expect(noteFrontmatter.opengraph['image:type']).toEqual('image/png')
  })
})
