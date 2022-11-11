/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownRendererExtension } from './base/markdown-renderer-extension'
import type MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'

/**
 * Adds headline anchors to the markdown rendering.
 */
export class HeadlineAnchorsMarkdownExtension extends MarkdownRendererExtension {
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
