/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceLegacyVimeoShortCodeMarkdownItPlugin } from './replace-legacy-vimeo-short-code'
import MarkdownIt from 'markdown-it'

describe('Replace legacy youtube short codes', () => {
  let markdownIt: MarkdownIt

  beforeEach(() => {
    markdownIt = new MarkdownIt('default', {
      html: false,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    markdownIt.use(replaceLegacyVimeoShortCodeMarkdownItPlugin)
  })

  it('detects a valid legacy youtube short code', () => {
    expect(markdownIt.renderInline('{%vimeo 12312312312 %}')).toBe('<app-vimeo id="12312312312"></app-vimeo>')
  })

  it("won't detect an empty string", () => {
    const code = '{%vimeo %}'
    expect(markdownIt.renderInline(code)).toBe(code)
  })

  it("won't detect letters", () => {
    const code = '{%vimeo 123123a2311 %}'
    expect(markdownIt.renderInline(code)).toBe(code)
  })

  it("won't detect an invalid(to short) youtube id", () => {
    const code = '{%vimeo 1 %}'
    expect(markdownIt.renderInline(code)).toBe(code)
  })

  it("won't detect an invalid(to long) youtube id", () => {
    const code = '{%vimeo 111111111111111111111111111111111 %}'
    expect(markdownIt.renderInline(code)).toBe(code)
  })
})
