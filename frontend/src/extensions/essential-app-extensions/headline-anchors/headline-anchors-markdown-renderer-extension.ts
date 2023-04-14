/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import type MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'

/**
 * Adds headline anchors to the markdown rendering.
 */
export class HeadlineAnchorsMarkdownRendererExtension extends MarkdownRendererExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    anchor(markdownIt, {
      permalink: anchor.permalink.ariaHidden({
        symbol: '🔗',
        class: 'heading-anchor text-dark',
        renderHref: (slug: string): string => `#${slug}`,
        placement: 'before'
      })
    })
  }
}
