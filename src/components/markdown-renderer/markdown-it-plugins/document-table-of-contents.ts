/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import MarkdownIt from 'markdown-it/lib'
import { TocAst } from 'markdown-it-toc-done-right'
import { documentToc } from './document-toc'

export const documentTableOfContents = (onTocChange: (toc: TocAst) => void): MarkdownIt.PluginSimple => {
  return (markdownIt) => documentToc(markdownIt, onTocChange)
}
