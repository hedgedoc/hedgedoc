/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NodeProcessor } from './node-processor'
import type { Document, Node } from 'domhandler'
import { hasChildren } from 'domhandler'

/**
 * Base class for traveler node processors whose processing is executed on the given node and every child.
 */
export abstract class TravelerNodeProcessor extends NodeProcessor {
  process(nodes: Document): Document {
    this.processNodes(nodes.children)
    return nodes
  }

  private processNodes(nodes: Node[]): void {
    nodes.forEach((node) => {
      this.processNode(node)
      if (hasChildren(node)) {
        this.processNodes(node.children)
      }
    })
  }

  protected abstract processNode(node: Node): void
}
