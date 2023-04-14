/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceYouTubeLinkMarkdownItPlugin } from './replace-youtube-link'
import MarkdownIt from 'markdown-it'

describe('Replace youtube link', () => {
  let markdownIt: MarkdownIt

  beforeEach(() => {
    markdownIt = new MarkdownIt('default', {
      html: false,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    markdownIt.use(replaceYouTubeLinkMarkdownItPlugin)
  })
  ;['http://', 'https://', ''].forEach((protocol) => {
    ;['www.', ''].forEach((subdomain) => {
      ;['youtube.com', 'youtube-nocookie.com'].forEach((domain) => {
        const origin = `${protocol}${subdomain}${domain}/`
        describe(origin, () => {
          const validUrl = `${origin}?v=12312312312`
          it(`can detect a correct youtube video url`, () => {
            expect(markdownIt.renderInline(validUrl)).toBe('<app-youtube id="12312312312"></app-youtube>')
          })

          it("won't detect an URL without video id", () => {
            expect(markdownIt.renderInline(origin)).toBe(origin)
          })

          it("won't detect an invalid(too short) youtube id", () => {
            const invalidUrl = `${origin}?v=1`
            expect(markdownIt.renderInline(invalidUrl)).toBe(invalidUrl)
          })

          it("won't detect an invalid(invalid characters) youtube id", () => {
            const invalidUrl = `${origin}?v= /!#/`
            expect(markdownIt.renderInline(invalidUrl)).toBe(invalidUrl)
          })

          it("won't detect an invalid(too long) youtube id", () => {
            const invalidUrl = `${origin}?v=111111111111111111111111111111111`
            expect(markdownIt.renderInline(invalidUrl)).toBe(invalidUrl)
          })
        })
      })
    })
  })
})
