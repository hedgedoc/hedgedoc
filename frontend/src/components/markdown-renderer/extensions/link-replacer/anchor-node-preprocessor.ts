/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { TravelerNodeProcessor } from '../../node-preprocessors/traveler-node-processor'
import type { Node } from 'domhandler'
import { isTag } from 'domhandler'

/**
 * A preprocessor for links. It filters script and data links, converts relative URLs into absolute URLs and fixes jump marks.
 */
export class AnchorNodePreprocessor extends TravelerNodeProcessor {
  constructor(private baseUrl: string) {
    super()
  }

  protected processNode(node: Node): void {
    if (!isTag(node) || node.name !== 'a' || !node.attribs || !node.attribs.href) {
      return
    }

    const url = node.attribs.href.trim()

    // eslint-disable-next-line no-script-url
    if (url.startsWith('data:') || url.startsWith('javascript:') || url.startsWith('vbscript:')) {
      delete node.attribs.href
      return
    }

    const isJumpMark = url.slice(0, 1) === '#'

    if (isJumpMark) {
      node.attribs['data-jump-target-id'] = url.slice(1)
    } else {
      node.attribs.rel = 'noreferer noopener'
      node.attribs.target = '_blank'
    }

    try {
      node.attribs.href = new URL(url, this.baseUrl).toString()
    } catch {
      node.attribs.href = url
    }
  }
}
