/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-sup' {
  import MarkdownIt from 'markdown-it/lib'
  const markdownItSuperscript: MarkdownIt.PluginSimple
  export = markdownItSuperscript
}
