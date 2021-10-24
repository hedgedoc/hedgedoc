/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Element } from 'domhandler'
import { isTag } from 'domhandler'
import type { NativeRenderer, SubNodeTransform, ValidReactDomElement } from '../component-replacer'
import { ComponentReplacer } from '../component-replacer'

/**
 * Checks if the given node is a blockquote color definition
 *
 * @param node The node to check
 * @return true if the checked node is a blockquote color definition
 */
const isBlockquoteColorDefinition = (node: Element | undefined): boolean => {
  if (!node || !node.attribs || !node.attribs.class || !node.attribs['data-color']) {
    return false
  }
  return node.name === 'span' && node.attribs.class === 'quote-extra'
}

/**
 * Checks if any of the given nodes is the parent element of a color extra element.
 *
 * @param nodes The array of nodes to check
 * @return the found element or undefined if no element was found
 */
const findBlockquoteColorParentElement = (nodes: Element[]): Element | undefined => {
  return nodes.find((child) => {
    if (child.name !== 'p' || !child.children || child.children.length < 1) {
      return false
    }
    return child.children.filter(isTag).find(isBlockquoteColorDefinition) !== undefined
  })
}

/**
 * Detects blockquotes and checks if they contain a color tag.
 * If a color tag was found then the color will be applied to the node as border.
 */
export class ColoredBlockquoteReplacer extends ComponentReplacer {
  public replace(
    node: Element,
    subNodeTransform: SubNodeTransform,
    nativeRenderer: NativeRenderer
  ): ValidReactDomElement | undefined {
    if (node.name !== 'blockquote' || !node.children || node.children.length < 1) {
      return
    }
    const paragraph = findBlockquoteColorParentElement(node.children.filter(isTag))
    if (!paragraph) {
      return
    }
    const childElements = paragraph.children || []
    const optionsTag = childElements.filter(isTag).find(isBlockquoteColorDefinition)
    if (!optionsTag) {
      return
    }
    paragraph.children = childElements.filter((elem) => !isTag(elem) || !isBlockquoteColorDefinition(elem))
    const attributes = optionsTag.attribs
    if (!attributes || !attributes['data-color']) {
      return
    }
    node.attribs = Object.assign(node.attribs || {}, { style: `border-left-color: ${attributes['data-color']};` })
    return nativeRenderer()
  }
}
