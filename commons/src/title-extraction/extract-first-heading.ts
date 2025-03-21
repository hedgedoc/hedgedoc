/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Element, isTag, isText, Node, NodeWithChildren } from 'domhandler'

const headlineTagRegex = /^h[1-6]$/gi

/**
 * Extracts the text content of the first top level headline tag.
 *
 * @param nodes The node whose children should be checked for the headline
 * @return the plain text representation of the first headline. {@code undefined} if no headline has been found.
 */
export function extractFirstHeading(
  nodes: NodeWithChildren,
): string | undefined {
  const foundHeadlineNode = checkNodesForHeadline(nodes.children)
  if (!foundHeadlineNode) {
    return
  }
  return extractInnerTextFromNode(foundHeadlineNode).trim()
}

function checkNodesForHeadline(nodes: Node[]): Node | undefined {
  return nodes.find((node) => isTag(node) && node.name.match(headlineTagRegex))
}

function extractInnerTextFromNode(node: Node): string {
  if (isText(node)) {
    return node.nodeValue
  } else if (isTag(node)) {
    return extractInnerTextFromTag(node)
  } else {
    return ''
  }
}

function extractInnerTextFromTag(node: Element): string {
  if (
    node.name === 'a' &&
    findAttribute(node, 'class')?.value.split(' ').includes('heading-anchor')
  ) {
    return ''
  } else if (node.name === 'img') {
    return findAttribute(node, 'alt')?.value ?? ''
  } else {
    return node.children.reduce((state, child) => {
      return state + extractInnerTextFromNode(child)
    }, '')
  }
}

function findAttribute(node: Element, attributeName: string) {
  return node.attributes.find((attribute) => attribute.name === attributeName)
}
