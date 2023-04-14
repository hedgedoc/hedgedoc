/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { EventMarkdownRendererExtension } from '../../../components/markdown-renderer/extensions/_base-classes/event-markdown-renderer-extension'
import type { NodeProcessor } from '../../../components/markdown-renderer/node-preprocessors/node-processor'
import { ExtractFirstHeadlineNodeProcessor } from './extract-first-headline-node-processor'

/**
 * Adds first heading extraction to the renderer
 */
export class ExtractFirstHeadlineMarkdownExtension extends EventMarkdownRendererExtension {
  buildNodeProcessors(): NodeProcessor[] {
    return [new ExtractFirstHeadlineNodeProcessor(this.eventEmitter)]
  }
}
