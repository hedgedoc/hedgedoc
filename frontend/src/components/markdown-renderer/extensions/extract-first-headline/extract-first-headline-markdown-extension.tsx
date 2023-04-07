/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NodeProcessor } from '../../node-preprocessors/node-processor'
import { EventMarkdownRendererExtension } from '../base/event-markdown-renderer-extension'
import { ExtractFirstHeadlineNodeProcessor } from './extract-first-headline-node-processor'

/**
 * Adds first heading extraction to the renderer
 */
export class ExtractFirstHeadlineMarkdownExtension extends EventMarkdownRendererExtension {
  buildNodeProcessors(): NodeProcessor[] {
    return [new ExtractFirstHeadlineNodeProcessor(this.eventEmitter)]
  }
}
