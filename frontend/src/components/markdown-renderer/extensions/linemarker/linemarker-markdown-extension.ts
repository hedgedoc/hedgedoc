/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ComponentReplacer } from '../../replace-components/component-replacer'
import { MarkdownRendererExtension } from '../_base-classes/markdown-renderer-extension'
import type { LineMarkers } from './add-line-marker-markdown-it-plugin'
import { addLineMarkerMarkdownItPlugin } from './add-line-marker-markdown-it-plugin'
import { LinemarkerReplacer } from './linemarker-replacer'
import type MarkdownIt from 'markdown-it'

/**
 * Adds support for the generation of line marker elements which are needed for synced scrolling.
 */
export class LinemarkerMarkdownExtension extends MarkdownRendererExtension {
  public static readonly tagName = 'app-linemarker'

  constructor(private onLineMarkers?: (lineMarkers: LineMarkers[]) => void) {
    super()
  }

  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    addLineMarkerMarkdownItPlugin(markdownIt, this.onLineMarkers)
  }

  public buildReplacers(): ComponentReplacer[] {
    return [new LinemarkerReplacer()]
  }

  public buildTagNameAllowList(): string[] {
    return [LinemarkerMarkdownExtension.tagName]
  }
}
