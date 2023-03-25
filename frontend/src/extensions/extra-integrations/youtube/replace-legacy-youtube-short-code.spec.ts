/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceLegacyYoutubeShortCodeMarkdownItPlugin } from './replace-legacy-youtube-short-code'
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
    markdownIt.use(replaceLegacyYoutubeShortCodeMarkdownItPlugin)
  })

  it('detects a valid legacy youtube short code', () => {
    expect(markdownIt.renderInline('{%youtube 12312312312 %}')).toBe('<app-youtube id="12312312312"></app-youtube>')
  })

  it("won't detect an empty string", () => {
    const code = '{%youtube %}'
    expect(markdownIt.renderInline(code)).toBe(code)
  })

  it("won't detect an invalid(too short) youtube id", () => {
    const code = '{%youtube 1 %}'
    expect(markdownIt.renderInline(code)).toBe(code)
  })

  it("won't detect an invalid(invalid characters) youtube id", () => {
    const code = '{%youtube /!#/ %}'
    expect(markdownIt.renderInline(code)).toBe(code)
  })

  it("won't detect an invalid(too long) youtube id", () => {
    const code = '{%youtube 111111111111111111111111111111111 %}'
    expect(markdownIt.renderInline(code)).toBe(code)
  })
})
