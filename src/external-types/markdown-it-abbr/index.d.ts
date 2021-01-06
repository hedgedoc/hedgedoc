/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-abbr' {
  import MarkdownIt from 'markdown-it/lib'
  const markdownItAbbreviation: MarkdownIt.PluginSimple
  export = markdownItAbbreviation
}
