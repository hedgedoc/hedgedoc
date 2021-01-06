/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-front-matter' {
  import MarkdownIt from 'markdown-it/lib'
  export type FrontMatterPluginOptions = (rawMeta: string) => void
  const markdownItFrontMatter: MarkdownIt.PluginWithOptions<FrontMatterPluginOptions>
  export = markdownItFrontMatter
}
