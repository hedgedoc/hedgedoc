/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceVimeoLinkMarkdownItPlugin } from './replace-vimeo-link'
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
    markdownIt.use(replaceVimeoLinkMarkdownItPlugin)
  })
  ;['http://', 'https://', ''].forEach((protocol) => {
    ;['player.', ''].forEach((subdomain) => {
      ;['vimeo.com'].forEach((domain) => {
        const origin = `${protocol}${subdomain}${domain}/`
        describe(origin, () => {
          const validUrl = `${origin}23237102`
          it(`can detect a correct vimeo video url`, () => {
            expect(markdownIt.renderInline(validUrl)).toBe("<app-vimeo id='23237102'></app-vimeo>")
          })

          it("won't detect an URL without video id", () => {
            expect(markdownIt.renderInline(origin)).toBe(origin)
          })
        })
      })
    })
  })
})
