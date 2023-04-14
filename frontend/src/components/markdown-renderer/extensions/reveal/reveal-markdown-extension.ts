/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeProcessor } from '../../node-preprocessors/node-processor'
import { MarkdownRendererExtension } from '../_base-classes/markdown-renderer-extension'
import { RevealCommentCommandNodePreprocessor } from './process-reveal-comment-nodes'
import { addSlideSectionsMarkdownItPlugin } from './reveal-sections'
import type MarkdownIt from 'markdown-it'

/**
 * Adds support for reveal.js to the markdown rendering.
 * This includes the generation of sections and the manipulation of elements using reveal comments.
 */
export class RevealMarkdownExtension extends MarkdownRendererExtension {
  public configureMarkdownIt(markdownIt: MarkdownIt): void {
    addSlideSectionsMarkdownItPlugin(markdownIt)
  }

  public buildNodeProcessors(): NodeProcessor[] {
    return [new RevealCommentCommandNodePreprocessor()]
  }
}
