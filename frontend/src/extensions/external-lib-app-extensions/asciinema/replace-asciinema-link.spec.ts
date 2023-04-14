/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceAsciinemaLinkMarkdownItPlugin } from './replace-asciinema-link'
import MarkdownIt from 'markdown-it/lib'

describe('Replace asciinema link', () => {
  let markdownIt: MarkdownIt

  beforeEach(() => {
    markdownIt = new MarkdownIt('default', {
      html: false,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    markdownIt.use(replaceAsciinemaLinkMarkdownItPlugin)
  })

  it('will replace a valid URL', () => {
    expect(markdownIt.renderInline('https://asciinema.org/a/123981234')).toBe(
      `<app-asciinema id='123981234'></app-asciinema>`
    )
  })

  it('will replace a valid URL with appendix', () => {
    expect(markdownIt.renderInline('https://asciinema.org/a/123981234?a=1')).toBe(
      `<app-asciinema id='123981234'></app-asciinema>`
    )
  })

  it("won't replace an URL without path", () => {
    expect(markdownIt.renderInline('https://asciinema.org/123981234')).toBe(`https://asciinema.org/123981234`)
  })

  it("won't replace an URL with non-numeric id", () => {
    expect(markdownIt.renderInline('https://asciinema.org/a/12f3981234')).toBe(`https://asciinema.org/a/12f3981234`)
  })
})
