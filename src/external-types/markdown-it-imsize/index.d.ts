/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

declare module 'markdown-it-imsize' {
  import MarkdownIt from 'markdown-it/lib'
  import { ImsizeOptions } from './interface'
  const markdownItImsize: MarkdownIt.PluginWithOptions<ImsizeOptions>
  export = markdownItImsize
}
