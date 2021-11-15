/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from './markdown-extension'
import type MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'

export class HeadlineAnchorsMarkdownExtension extends MarkdownExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    anchor(markdownIt, {
      permalink: anchor.permalink.ariaHidden({
        symbol: '<i class="fa fa-link"></i>',
        class: 'heading-anchor text-dark',
        renderHref: (slug: string): string => `#${slug}`,
        placement: 'before'
      })
    })
  }
}
