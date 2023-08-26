/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: MIT
 */

import MarkdownIt from 'markdown-it/lib'
import { toc } from './plugin.js'
import { describe, expect, it, jest } from '@jest/globals'

describe('toc', () => {
  const simpleContent = `
[toc]

# Head 1

## Heading 2

### Heading 3
`

  it('renders a toc with default settings', () => {
    const markdownIt = new MarkdownIt().use(toc)
    expect(
      markdownIt.render(`
[toc]

# Head 1

## Heading 2

### Heading 3

# Head 1

# Head 1

# Head 1
`)
    ).toMatchSnapshot()
  })

  it('renders a toc with custom slugify', () => {
    const markdownIt = new MarkdownIt().use(toc, { slugify: (slug, index) => `slug-${slug}-${index}` })
    expect(markdownIt.render(simpleContent)).toMatchSnapshot()
  })

  it('renders a toc with custom unique slug start index', () => {
    const markdownIt = new MarkdownIt().use(toc, { uniqueSlugStartIndex: 10 })
    expect(markdownIt.render(simpleContent)).toMatchSnapshot()
  })

  it('renders a toc with custom classes', () => {
    const markdownIt = new MarkdownIt().use(toc, {
      containerClass: 'containerClass',
      listClass: 'listClass',
      itemClass: 'itemClass',
      linkClass: 'linkClass',
      containerId: 'containerId'
    })
    expect(markdownIt.render(simpleContent)).toMatchSnapshot()
  })

  it('renders a toc with a single level number', () => {
    const markdownIt = new MarkdownIt().use(toc, { level: 2 })
    expect(
      markdownIt.render(`
[toc]

# Head 1

## Head 2

### Head 3
`)
    ).toMatchSnapshot()
  })

  it('renders a toc with a level number array', () => {
    const markdownIt = new MarkdownIt().use(toc, { level: [2, 4] })
    expect(
      markdownIt.render(`
[toc]

# Head 1

## Head 2

### Head 3

#### Head 4
`)
    ).toMatchSnapshot()
  })

  it('renders a toc with levels in the placeholder', () => {
    const markdownIt = new MarkdownIt().use(toc)
    expect(
      markdownIt.render(`
[toc:2:3]

# Head 1

## Head 2

### Head 3

#### Head 4
`)
    ).toMatchSnapshot()
  })

  it('ignores the levels in the placeholder if not sorted', () => {
    const markdownIt = new MarkdownIt().use(toc)
    expect(
      markdownIt.render(`
[toc:3:2]

# Head 1

## Head 2

### Head 3

#### Head 4
`)
    ).toMatchSnapshot()
  })

  it('renders a toc with ordered list', () => {
    const markdownIt = new MarkdownIt().use(toc, { listType: 'ol' })
    expect(markdownIt.render(simpleContent)).toMatchSnapshot()
  })

  it('renders a toc with unordered list', () => {
    const markdownIt = new MarkdownIt().use(toc, { listType: 'ul' })
    expect(markdownIt.render(simpleContent)).toMatchSnapshot()
  })

  it('renders a toc with custom format function', () => {
    const markdownIt = new MarkdownIt().use(toc, { format: (name) => name.toUpperCase() })
    expect(markdownIt.render(simpleContent)).toMatchSnapshot()
  })

  it('renders a toc and executes the callback', () => {
    const callback = jest.fn()
    const markdownIt = new MarkdownIt().use(toc, { callback })
    markdownIt.render(simpleContent)
    expect(callback).toBeCalledWith({
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [],
                  level: 3,
                  name: 'Heading 3'
                }
              ],
              level: 2,
              name: 'Heading 2'
            }
          ],
          level: 1,
          name: 'Head 1'
        }
      ],
      level: 0,
      name: ''
    })
  })

  it('renders a toc with custom allowed token types', () => {
    const markdownIt = new MarkdownIt().use(toc, { allowedTokenTypes: ['text'] })
    expect(
      markdownIt.render(`
[toc]

# \`Head 1\` text

# Head 2
    `)
    ).toMatchSnapshot()
  })
})
