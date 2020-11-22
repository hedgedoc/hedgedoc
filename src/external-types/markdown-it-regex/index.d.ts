/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-regex' {
  import MarkdownIt from 'markdown-it/lib'
  import { RegexOptions } from './interface'
  const markdownItRegex: MarkdownIt.PluginWithOptions<RegexOptions>
  export = markdownItRegex
}
