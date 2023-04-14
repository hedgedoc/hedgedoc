/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacySpeakerdeckShortCode } from './replace-legacy-speakerdeck-short-code'
import MarkdownIt from 'markdown-it'

describe('Legacy speakerdeck short code', () => {
  it('replaces with link', () => {
    const markdownIt = new MarkdownIt('default', {
      html: false,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    markdownIt.use(legacySpeakerdeckShortCode)
    expect(markdownIt.renderInline('{%speakerdeck example/123456789 %}')).toEqual(
      '<a href="https://speakerdeck.com/example/123456789">https://speakerdeck.com/example/123456789</a>'
    )
  })
})
