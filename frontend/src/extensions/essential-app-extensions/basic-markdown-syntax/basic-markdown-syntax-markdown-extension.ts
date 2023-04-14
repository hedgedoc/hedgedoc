/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/markdown-renderer-extension'
import { imageSize } from '@hedgedoc/markdown-it-plugins'
import type MarkdownIt from 'markdown-it'
import abbreviation from 'markdown-it-abbr'
import definitionList from 'markdown-it-deflist'
import footnote from 'markdown-it-footnote'
import inserted from 'markdown-it-ins'
import marked from 'markdown-it-mark'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'

/**
 * Adds some common markdown syntaxes to the markdown rendering.
 */
export class BasicMarkdownSyntaxMarkdownExtension extends MarkdownRendererExtension {
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
