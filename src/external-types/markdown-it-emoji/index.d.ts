/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-emoji/bare' {
  import MarkdownIt from 'markdown-it/lib'
  import { EmojiOptions } from './interface'
  const markdownItEmoji: MarkdownIt.PluginWithOptions<EmojiOptions>
  export = markdownItEmoji
}
