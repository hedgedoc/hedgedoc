/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-toc-done-right' {
    import MarkdownIt from 'markdown-it/lib'
    import { TocOptions } from './interface'
    const markdownItTocDoneRight: MarkdownIt.PluginWithOptions<TocOptions>
    export = markdownItTocDoneRight
  }
