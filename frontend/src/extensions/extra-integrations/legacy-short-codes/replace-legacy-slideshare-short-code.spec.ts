/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySlideshareShortCode } from './replace-legacy-slideshare-short-code'
import MarkdownIt from 'markdown-it'

describe('Legacy slideshare short code', () => {
  it('replaces with link', () => {
    const markdownIt = new MarkdownIt('default', {
      html: false,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    markdownIt.use(legacySlideshareShortCode)
    expect(markdownIt.renderInline('{%slideshare example/123456789 %}')).toEqual(
      "<a href='https://www.slideshare.net/example/123456789'>https://www.slideshare.net/example/123456789</a>"
    )
  })
})
