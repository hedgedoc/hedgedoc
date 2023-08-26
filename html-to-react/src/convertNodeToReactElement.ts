/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ReactElement } from 'react'
import { Node } from 'domhandler'
import { ElementType } from 'domelementtype'
import { processTextNode } from './elementTypes/ProcessTextNode.js'
import { processTagNode } from './elementTypes/ProcessTagNode.js'
import { processStyleNode } from './elementTypes/ProcessStyleNode.js'
import { NodeToReactElementTransformer } from './NodeToReactElementTransformer.js'

/**
 * Converts a htmlparser2 node to a React element
 *
 * @param {Object} node The htmlparser2 node to convert
 * @param {Number} index The index of the current node
 * @param {Function} transform Transform function to apply to children of the node
 * @returns {React.Element}
 */
export function convertNodeToReactElement(
  node: Node,
  index: string | number,
  transform?: NodeToReactElementTransformer
): ReactElement | string | null {
  switch (node.type) {
    case ElementType.Text:
      return processTextNode(node)
    case ElementType.Tag:
      return processTagNode(node, index, transform)
    case ElementType.Style:
      return processStyleNode(node, index)
    default:
      return null
  }
}
