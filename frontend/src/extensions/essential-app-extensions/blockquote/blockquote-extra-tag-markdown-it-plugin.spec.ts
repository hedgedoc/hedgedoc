/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { BlockquoteExtraTagMarkdownItPlugin } from './blockquote-extra-tag-markdown-it-plugin'
import MarkdownIt from 'markdown-it'

describe('Quote extra syntax parser', () => {
  let markdownIt: MarkdownIt

  beforeEach(() => {
    markdownIt = new MarkdownIt('default', {
      html: false,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    new BlockquoteExtraTagMarkdownItPlugin('abc', 'markdown').registerRule(markdownIt)
  })

  it('should parse a valid tag', () => {
    expect(markdownIt.renderInline('[abc=markdown]')).toEqual(
      '<app-blockquote-tag data-label=\'abc\' data-icon="markdown">markdown</app-blockquote-tag>'
    )
  })

  it("shouldn't parse a tag with no opener bracket", () => {
    expect(markdownIt.renderInline('abc=def]')).toEqual('abc=def]')
  })

  it("shouldn't parse a tag with no closing bracket", () => {
    expect(markdownIt.renderInline('[abc=def')).toEqual('[abc=def')
  })

  it("shouldn't parse a tag with no separation character", () => {
    expect(markdownIt.renderInline('[abcdef]')).toEqual('[abcdef]')
  })

  it("shouldn't parse a tag with an empty label", () => {
    expect(markdownIt.renderInline('[=def]')).toEqual('[=def]')
  })

  it("shouldn't parse a tag with an empty value", () => {
    expect(markdownIt.renderInline('[abc=]')).toEqual('[abc=]')
  })

  it("shouldn't parse a tag with an empty body", () => {
    expect(markdownIt.renderInline('[]')).toEqual('[]')
  })
})
