/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from '../markdown-extension'
import type MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji/bare'
import { combinedEmojiData } from './mapping'

/**
 * Adds support for utf-8 emojis.
 */
export class EmojiMarkdownExtension extends MarkdownExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    markdownIt.use(emoji, {
      defs: combinedEmojiData
    })
  }
}
