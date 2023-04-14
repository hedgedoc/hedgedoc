/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceBootstrapIconsMarkdownItPlugin } from './replace-bootstrap-icons'
import MarkdownIt from 'markdown-it'

describe('Replace bootstrap icons', () => {
  let markdownIt: MarkdownIt

  beforeEach(() => {
    markdownIt = new MarkdownIt('default', {
      html: false,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    markdownIt.use(replaceBootstrapIconsMarkdownItPlugin)
  })
  it(`can detect a correct icon`, () => {
    expect(markdownIt.renderInline(':bi-alarm:')).toBe('<app-bootstrap-icon id="alarm"></app-bootstrap-icon>')
  })

  it("won't detect an invalid id", () => {
    const invalidIcon = ':bi-invalid:'
    expect(markdownIt.renderInline(invalidIcon)).toBe(invalidIcon)
  })

  it("won't detect an empty id", () => {
    const invalidIcon = ':bi-:'
    expect(markdownIt.renderInline(invalidIcon)).toBe(invalidIcon)
  })

  it("won't detect a wrong id", () => {
    const invalidIcon = ':bi-%?(:'
    expect(markdownIt.renderInline(invalidIcon)).toBe(invalidIcon)
  })
})
