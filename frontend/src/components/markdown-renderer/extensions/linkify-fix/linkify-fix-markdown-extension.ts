/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../_base-classes/markdown-renderer-extension'
import type MarkdownIt from 'markdown-it'
import linkify from 'markdown-it/lib/rules_core/linkify'
import tlds from 'tlds'

/**
 * A markdown extension that detects plain text URLs and converts them into links.
 */
export class LinkifyFixMarkdownExtension extends MarkdownRendererExtension {
  public configureMarkdownItPost(markdownIt: MarkdownIt): void {
    markdownIt.linkify.tlds(tlds)
    markdownIt.core.ruler.push('linkify', (state) => {
      try {
        state.md.options.linkify = true
        return linkify(state)
      } finally {
        state.md.options.linkify = false
      }
    })
  }
}
