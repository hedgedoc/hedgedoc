/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Node } from 'domhandler'
import { isText } from 'domhandler'

/**
 * Converts a text node to a React text element
 *
 * @param {Object} node The text node
 * @returns {String} The text
 */
export function processTextNode(node: Node): string | null {
  // React will accept plain text for rendering so just return the node data
  return isText(node) ? node.data : null
}
