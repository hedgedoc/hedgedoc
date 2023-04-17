/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Element, Node } from 'domhandler'
import { isText } from 'domhandler'
import type { ReactElement } from 'react'

export type ValidReactDomElement = ReactElement | string | null

export type SubNodeTransform = (node: Node, subKey: number | string) => ValidReactDomElement

export type NativeRenderer = () => ValidReactDomElement

export const DO_NOT_REPLACE = Symbol()

export type NodeReplacement = ValidReactDomElement | typeof DO_NOT_REPLACE

export enum ReplacerPriority {
  LOWER = 1,
  NORMAL = 0,
  HIGHER = -1
}

/**
 * Base class for all component replacers.
 * Component replacers detect structures in the HTML DOM from markdown it
 * and replace them with some special react components.
 */
export abstract class ComponentReplacer {
  /**
   * Extracts the content of the first text child node.
   *
   * @param node the node with the text node child
   * @return the string content
   */
  protected static extractTextChildContent(node: Element): string {
    const childrenTextNode = node.children[0]
    return isText(childrenTextNode) ? childrenTextNode.data : ''
  }

  /**
   * Applies the given {@link SubNodeTransform sub node transformer} to every children of the given {@link Node}.
   *
   * @param node The node whose children should be transformed
   * @param subNodeTransform The transformer that should be used.
   * @return The children as react elements.
   */
  protected static transformChildren(node: Element, subNodeTransform: SubNodeTransform): ValidReactDomElement[] {
    return node.children.map((value, index) => subNodeTransform(value, index))
  }

  /**
   * Should be used to reset the replacers internal state before rendering.
   */
  public reset(): void {
    // left blank for overrides
  }

  /**
   * Checks if the current node should be altered or replaced and does if needed.
   *
   * @param node The current html dom node
   * @param subNodeTransform should be used to convert child elements of the current node
   * @param nativeRenderer renders the current node without any replacement
   * @return the replacement for the current node or undefined if the current replacer replacer hasn't done anything.
   */
  public abstract replace(
    node: Element,
    subNodeTransform: SubNodeTransform,
    nativeRenderer: NativeRenderer
  ): NodeReplacement

  /**
   * Defines that a replacer should be preferred more or less than other replacers.
   *
   * @return the replacer priority that gets compared to others.
   */
  public getPriority(): ReplacerPriority {
    return ReplacerPriority.NORMAL
  }
}
