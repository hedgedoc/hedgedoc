/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Document } from 'domhandler'
import render from 'dom-serializer'
import DOMPurify from 'dompurify'
import { parseDocument } from 'htmlparser2'
import { NodeProcessor } from '../../node-preprocessors/node-processor'

/**
 * Sanitizes the given {@link Document document}.
 *
 * @see https://cure53.de/purify
 */
export class SanitizerNodePreprocessor extends NodeProcessor {
  constructor(private tagNameWhiteList: string[]) {
    super()
  }

  process(nodes: Document): Document {
    const sanitizedHtml = DOMPurify.sanitize(render(nodes), {
      ADD_TAGS: this.tagNameWhiteList
    })
    return parseDocument(sanitizedHtml)
  }
}
