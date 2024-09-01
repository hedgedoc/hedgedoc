/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NodeProcessor } from '../../../components/markdown-renderer/node-preprocessors/node-processor'
import { extractFirstHeading } from '@hedgedoc/commons'
import type { Document } from 'domhandler'
import type { EventEmitter2 } from 'eventemitter2'

/**
 * Searches for the first headline tag and extracts its plain text content.
 */
export class ExtractFirstHeadlineNodeProcessor extends NodeProcessor {
  public static readonly EVENT_NAME = 'HeadlineExtracted'

  constructor(private eventEmitter: EventEmitter2) {
    super()
  }

  process(nodes: Document): Document {
    this.eventEmitter.emit(ExtractFirstHeadlineNodeProcessor.EVENT_NAME, extractFirstHeading(nodes))
    return nodes
  }
}
