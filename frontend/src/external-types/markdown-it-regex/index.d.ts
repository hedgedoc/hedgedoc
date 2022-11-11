/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-regex' {
  import type MarkdownIt from 'markdown-it/lib'
  import type { RegexOptions } from './interface'
  const markdownItRegex: MarkdownIt.PluginWithOptions<RegexOptions>
  export = markdownItRegex
}
