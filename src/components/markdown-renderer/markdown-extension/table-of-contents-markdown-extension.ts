/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownExtension } from './markdown-extension'
import type MarkdownIt from 'markdown-it'
import type { TocAst } from 'markdown-it-toc-done-right'
import toc from 'markdown-it-toc-done-right'
import { tocSlugify } from '../../editor-page/table-of-contents/toc-slugify'

export class TableOfContentsMarkdownExtension extends MarkdownExtension {
  constructor(private onTocChange?: (ast: TocAst) => void) {
    super()
  }

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    if (!this.onTocChange) {
      return
    }
    toc(markdownIt, {
      placeholder: '(\\[TOC\\]|\\[toc\\])',
      listType: 'ul',
      level: [1, 2, 3],
      callback: (code: string, ast: TocAst): void => {
        this.onTocChange?.(ast)
      },
      slugify: tocSlugify
    })
  }
}
