/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { combinedEmojiData } from './mapping'
import type MarkdownIt from 'markdown-it'
import emoji from 'markdown-it-emoji/bare'

/**
 * Adds support for utf-8 emojis.
 */
export class EmojiMarkdownRendererExtension extends MarkdownRendererExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    markdownIt.use(emoji, {
      defs: combinedEmojiData
    })
  }
}
