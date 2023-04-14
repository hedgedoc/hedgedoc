/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { legacyPdfShortCode } from './replace-legacy-pdf-short-code'
import MarkdownIt from 'markdown-it'

describe('Legacy pdf short code', () => {
  it('replaces with link', () => {
    const markdownIt = new MarkdownIt('default', {
      html: false,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    markdownIt.use(legacyPdfShortCode)
    expect(
      markdownIt.renderInline('{%pdf https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf %}')
    ).toEqual(
      `<a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf">https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf</a>`
    )
  })
})
