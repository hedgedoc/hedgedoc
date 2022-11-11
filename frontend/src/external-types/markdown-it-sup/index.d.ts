/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-sup' {
  import type MarkdownIt from 'markdown-it/lib'
  const markdownItSuperscript: MarkdownIt.PluginSimple
  export = markdownItSuperscript
}
