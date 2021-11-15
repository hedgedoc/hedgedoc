/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from './markdown-extension'
import linkify from 'markdown-it/lib/rules_core/linkify'
import type MarkdownIt from 'markdown-it'

export class LinkifyFixMarkdownExtension extends MarkdownExtension {
  public configureMarkdownItPost(markdownIt: MarkdownIt): void {
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
