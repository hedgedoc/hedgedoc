/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Logger } from '../../../../utils/logger'
import { TravelerNodeProcessor } from '../../node-preprocessors/traveler-node-processor'
import type { DataNode, Element, Node } from 'domhandler'
import { isComment, isTag } from 'domhandler'

const log = new Logger('reveal.js > Comment Node Preprocessor')
const revealCommandSyntax = /^\s*\.(\w*):(.*)$/g
const dataAttributesSyntax = /\s*(data-[\w-]*|class)=(?:"((?:[^"\\]|\\"|\\)*)"|'([^']*)')/g

/**
 * Travels through the given {@link Document}, searches for reveal command comments and applies them.
 *
 * @param doc The document that should be changed
 * @return The edited document
 */
export class RevealCommentCommandNodePreprocessor extends TravelerNodeProcessor {
  protected processNode(node: Node): void {
    if (isComment(node)) {
      processCommentNode(node)
    }
  }
}

/**
 * Processes the given {@link DataNode html comment} by parsing it, finding the element that should be changed and applies the contained changes.
 *
 * @param node The node that contains the reveal command.
 */
const processCommentNode = (node: DataNode): void => {
  const regexResult = node.data.split(revealCommandSyntax)
  if (regexResult.length === 1) {
    return
  }

  const parentNode: Element | null = findTargetElement(node, regexResult[1])
  if (!parentNode) {
    return
  }

  const matches = [...regexResult[2].matchAll(dataAttributesSyntax)]
  for (const dataAttribute of matches) {
    const attributeName = dataAttribute[1]
    const attributeValue = dataAttribute[2] ?? dataAttribute[3]
    if (attributeValue) {
      log.debug(
        `Add attribute "${attributeName}"=>"${attributeValue}" to node`,
        parentNode,
        'because of',
        regexResult[1],
        'selector'
      )
      parentNode.attribs[attributeName] = attributeValue
    }
  }
}

/**
 * Finds the ancestor element that should be changed based on the given selector.
 *
 * @param node The node whose ancestor should be found.
 * @param selector The found ancestor node or null if no node could be found.
 * @return The ancestor element, if it exists. {@link undefined} otherwise.
 */
const findTargetElement = (node: Node, selector: string): Element | null => {
  if (selector === 'slide') {
    return findNearestAncestorSection(node)
  } else if (selector === 'element') {
    return findParentElement(node)
  } else {
    return null
  }
}

/**
 * Returns the parent node if it is an {@link Element}.
 *
 * @param node the found node or null if no parent node exists or if the parent node isn't an {@link Element}.
 * @return The parent node, if it exists. {@link undefined} otherwise.
 */
const findParentElement = (node: Node): Element | null => {
  return node.parentNode !== null && isTag(node.parentNode) ? node.parentNode : null
}

/**
 * Looks for the nearest ancestor of the node that is a section element.
 *
 * @param node the found section node or null if no section ancestor could be found.
 * @return The nearest ancestor element, if it exists. {@link undefined} otherwise.
 */
const findNearestAncestorSection = (node: Node): Element | null => {
  let currentNode = node.parentNode
  while (currentNode != null) {
    if (isTag(currentNode) && currentNode.tagName === 'section') {
      break
    }
    currentNode = node.parentNode
  }
  return currentNode
}
