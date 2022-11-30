/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { tocSlugify } from '../../editor-page/table-of-contents/toc-slugify'
import { MarkdownRendererExtension } from './base/markdown-renderer-extension'
import equal from 'fast-deep-equal'
import type MarkdownIt from 'markdown-it'
import type { TocAst } from 'markdown-it-toc-done-right'
import toc from 'markdown-it-toc-done-right'

/**
 * Adds table of content to the markdown rendering.
 */
export class TableOfContentsMarkdownExtension extends MarkdownRendererExtension {
  public static readonly EVENT_NAME = 'TocChange'
  private lastAst: TocAst | undefined = undefined

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    toc(markdownIt, {
      placeholder: '(\\[TOC\\]|\\[toc\\])',
      listType: 'ul',
      level: [1, 2, 3],
      callback: (code: string, ast: TocAst): void => {
        if (equal(ast, this.lastAst)) {
          return
        }
        this.lastAst = ast
        this.eventEmitter?.emit(TableOfContentsMarkdownExtension.EVENT_NAME, ast)
      },
      slugify: tocSlugify
    })
  }
}
