/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { parseRawFrontmatterFromYaml } from './parse-raw-frontmatter-from-yaml.js'
import { describe, expect, it } from '@jest/globals'

describe('yaml frontmatter', () => {
  it('should parse "title"', () => {
    const noteFrontmatter = parseRawFrontmatterFromYaml('title: test')
    expect(noteFrontmatter.value?.title).toEqual('test')
  })

  it('should parse "robots"', () => {
    const noteFrontmatter = parseRawFrontmatterFromYaml('robots: index, follow')
    expect(noteFrontmatter.value?.robots).toEqual('index, follow')
  })

  it('should parse the deprecated tags syntax', () => {
    const noteFrontmatter = parseRawFrontmatterFromYaml('tags: test123, abc')
    expect(noteFrontmatter.value?.tags).toEqual('test123, abc')
  })

  it('should parse the tags list syntax', () => {
    const noteFrontmatter = parseRawFrontmatterFromYaml(`tags:
      - test123
      - abc
    `)
    expect(noteFrontmatter.value?.tags).toEqual(['test123', 'abc'])
  })

  it('should parse the tag inline-list syntax', () => {
    const noteFrontmatter = parseRawFrontmatterFromYaml(
      "tags: ['test123', 'abc']",
    )
    expect(noteFrontmatter.value?.tags).toEqual(['test123', 'abc'])
  })

  it('should parse "breaks"', () => {
    const noteFrontmatter = parseRawFrontmatterFromYaml('breaks: false')
    expect(noteFrontmatter.value?.breaks).toEqual(false)
  })

  it('should parse an opengraph title', () => {
    const noteFrontmatter = parseRawFrontmatterFromYaml(`opengraph:
      title: Testtitle
    `)
    expect(noteFrontmatter.value?.opengraph.title).toEqual('Testtitle')
  })

  it('should parse multiple opengraph values', () => {
    const noteFrontmatter = parseRawFrontmatterFromYaml(`opengraph:
      title: Testtitle
      image: https://dummyimage.com/48.png
      image:type: image/png
    `)
    expect(noteFrontmatter.value?.opengraph.title).toEqual('Testtitle')
    expect(noteFrontmatter.value?.opengraph.image).toEqual(
      'https://dummyimage.com/48.png',
    )
    expect(noteFrontmatter.value?.opengraph['image:type']).toEqual('image/png')
  })

  it('allows unknown additional options', () => {
    const noteFrontmatter = parseRawFrontmatterFromYaml(`title: title
additonal: "additonal"`)

    expect(noteFrontmatter.value?.title).toBe('title')
  })

  it('throws an error if the yaml is invalid', () => {
    const a = parseRawFrontmatterFromYaml('A: asd\n  B: asd')
    expect(a.error?.message).toStrictEqual('Invalid YAML')
  })
})
