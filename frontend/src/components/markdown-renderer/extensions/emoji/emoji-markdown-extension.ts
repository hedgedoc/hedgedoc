/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownRendererExtension } from '../base/markdown-renderer-extension'
import type MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji/bare'
import { combinedEmojiData } from './mapping'

/**
 * Adds support for utf-8 emojis.
 */
export class EmojiMarkdownExtension extends MarkdownRendererExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    markdownIt.use(emoji, {
      defs: combinedEmojiData
    })
  }
}
