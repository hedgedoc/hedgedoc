/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-emoji' {
  import type MarkdownIt from 'markdown-it/lib'
  import type { EmojiOptions } from './interface'
  const markdownItEmoji: MarkdownIt.PluginWithOptions<EmojiOptions>
  const pluginVariations = {
    bare: markdownItEmoji,
    light: markdownItEmoji,
    full: markdownItEmoji
  }
  export = pluginVariations
}
