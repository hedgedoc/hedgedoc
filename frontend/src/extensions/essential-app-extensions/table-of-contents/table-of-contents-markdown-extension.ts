/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { tocSlugify } from '../../../components/editor-page/table-of-contents/toc-slugify'
import { EventMarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/event-markdown-renderer-extension'
import type { TocAst } from '@hedgedoc/markdown-it-plugins'
import { toc } from '@hedgedoc/markdown-it-plugins'
import equal from 'fast-deep-equal'
import type MarkdownIt from 'markdown-it'

/**
 * Adds table of content to the markdown rendering.
 */
export class TableOfContentsMarkdownExtension extends EventMarkdownRendererExtension {
  public static readonly EVENT_NAME = 'TocChange'
  private lastAst: TocAst | undefined = undefined

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    const eventEmitter = this.eventEmitter
    if (eventEmitter !== undefined) {
      toc(markdownIt, {
        listType: 'ul',
        level: [1, 2, 3],
        callback: (ast: TocAst): void => {
          if (equal(ast, this.lastAst)) {
            return
          }
          this.lastAst = ast
          eventEmitter.emit(TableOfContentsMarkdownExtension.EVENT_NAME, ast)
        },
        slugify: tocSlugify
      })
    }
  }
}
