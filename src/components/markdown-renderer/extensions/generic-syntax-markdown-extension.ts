/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MarkdownRendererExtension } from './base/markdown-renderer-extension'
import type MarkdownIt from 'markdown-it'
import abbreviation from 'markdown-it-abbr'
import definitionList from 'markdown-it-deflist'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import inserted from 'markdown-it-ins'
import marked from 'markdown-it-mark'
import footnote from 'markdown-it-footnote'
import { imageSize } from '@hedgedoc/markdown-it-image-size'

/**
 * Adds some common markdown syntaxes to the markdown rendering.
 */
export class GenericSyntaxMarkdownExtension extends MarkdownRendererExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    abbreviation(markdownIt)
    definitionList(markdownIt)
    subscript(markdownIt)
    superscript(markdownIt)
    inserted(markdownIt)
    marked(markdownIt)
    footnote(markdownIt)
    imageSize(markdownIt)
  }
}
