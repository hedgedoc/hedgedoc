/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement } from 'react'
import { processNodes } from '../processNodes.js'
import { generatePropsFromAttributes } from '../utils/generatePropsFromAttributes.js'
import { isValidTagOrAttributeName } from '../utils/isValidTagOrAttributeName.js'
import { isTag, Node } from 'domhandler'
import { VOID_ELEMENTS } from '../dom/elements/VoidElements.js'
import { NodeToReactElementTransformer } from '../NodeToReactElementTransformer.js'

/**
 * Converts any element (excluding style - see StyleElementType - and script) to a react element.
 *
 * @param {Object} node The tag node
 * @param {String} index The index of the React element relative to it's parent
 * @param {Function} transform The transform function to apply to all children
 * @returns {React.Element} The React tag element
 */
export function processTagNode(
  node: Node,
  index: number | string,
  transform?: NodeToReactElementTransformer
): ReactElement | null {
  if (!isTag(node)) {
    return null
  }
  const tagName = node.tagName

  // validate tag name
  if (!isValidTagOrAttributeName(tagName)) {
    return null
  }

  // generate props
  const props = generatePropsFromAttributes(node.attribs, index)

  // If the node is not a void element and has children then process them
  let children = null
  if (VOID_ELEMENTS.indexOf(tagName) === -1) {
    children = processNodes(node.children, transform)
  }

  // create and return the element
  return React.createElement(tagName, props, children)
}
