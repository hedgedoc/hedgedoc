/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement } from 'react'
import { generatePropsFromAttributes } from '../utils/generatePropsFromAttributes.js'
import { isText } from 'domhandler'
import { isTag, Node } from 'domhandler'

/**
 * Converts a <style> element to a React element
 *
 * @param {Object} node The style node
 * @param {String} index The index of the React element relative to it's parent
 * @returns {React.Element} The React style element
 */
export function processStyleNode(
  node: Node,
  index: number | string
): ReactElement | null {
  if (!isTag(node)) {
    return null
  }
  // The style element only ever has a single child which is the styles so try and find this to add as
  // a child to the style element that will be created
  let styles
  if (node.children.length > 0) {
    const subNode = node.children[0]
    if (isText(subNode)) {
      styles = subNode.data
    }
  }

  // generate props
  const props = generatePropsFromAttributes(node.attribs, index)

  // create and return the element
  return React.createElement('style', props, styles)
}
