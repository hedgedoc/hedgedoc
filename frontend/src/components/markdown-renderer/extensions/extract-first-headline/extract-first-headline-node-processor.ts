/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NodeProcessor } from '../../node-preprocessors/node-processor'
import { Optional } from '@mrdrogdrog/optional'
import type { Document, Node, Element } from 'domhandler'
import { isTag, isText } from 'domhandler'
import type { EventEmitter2 } from 'eventemitter2'

const headlineTagRegex = /^h[1-6]$/gi

/**
 * Searches for the first headline tag and extracts its plain text content.
 */
export class ExtractFirstHeadlineNodeProcessor extends NodeProcessor {
  public static readonly EVENT_NAME = 'HeadlineExtracted'

  constructor(private eventEmitter: EventEmitter2) {
    super()
  }

  process(nodes: Document): Document {
    Optional.ofNullable(this.checkNodesForHeadline(nodes.children))
      .map((foundHeadlineNode) => this.extractInnerTextFromNode(foundHeadlineNode).trim())
      .filter((text) => text !== '')
      .ifPresent((text) => this.eventEmitter.emit(ExtractFirstHeadlineNodeProcessor.EVENT_NAME, text))
    return nodes
  }

  private checkNodesForHeadline(nodes: Node[]): Node | undefined {
    return nodes.find((node) => isTag(node) && node.name.match(headlineTagRegex))
  }

  private extractInnerTextFromNode(node: Node): string {
    if (isText(node)) {
      return node.nodeValue
    } else if (isTag(node)) {
      return this.extractInnerTextFromTag(node)
    } else {
      return ''
    }
  }

  private extractInnerTextFromTag(node: Element): string {
    if (node.name === 'a' && this.findAttribute(node, 'class')?.value.includes('heading-anchor')) {
      return ''
    } else if (node.name === 'img') {
      return this.findAttribute(node, 'alt')?.value ?? ''
    } else {
      return node.children.reduce((state, child) => {
        return state + this.extractInnerTextFromNode(child)
      }, '')
    }
  }

  private findAttribute(node: Element, attributeName: string) {
    return node.attributes.find((attribute) => attribute.name === attributeName)
  }
}
