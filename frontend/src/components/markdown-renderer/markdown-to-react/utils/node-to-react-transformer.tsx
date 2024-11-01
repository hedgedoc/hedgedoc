/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { LinemarkerMarkdownExtension } from '../../extensions/linemarker/linemarker-markdown-extension'
import type { LineWithId } from '../../extensions/linemarker/types'
import type {
  ComponentReplacer,
  NodeReplacement,
  ValidReactDomElement
} from '../../replace-components/component-replacer'
import { DO_NOT_REPLACE } from '../../replace-components/component-replacer'
import { convertNodeToReactElement } from '@hedgedoc/html-to-react'
import { Optional } from '@mrdrogdrog/optional'
import type { Element, Node } from 'domhandler'
import { isTag } from 'domhandler'
import React from 'react'

type LineIndexPair = [startLineIndex: number, endLineIndex: number]

/**
 * Converts {@link Node domhandler nodes} to react elements by using direct translation or {@link ComponentReplacer replacers}.
 */
export class NodeToReactTransformer {
  private lineIds: LineWithId[] = []
  private replacers: ComponentReplacer[] = []

  public setLineIds(lineIds: LineWithId[]): void {
    this.lineIds = lineIds
  }

  public setReplacers(replacers: ComponentReplacer[]): void {
    this.replacers = new Array(...replacers).sort(this.compareReplacers.bind(this))
  }

  private compareReplacers(replacerA: ComponentReplacer, replacerB: ComponentReplacer): number {
    const priorityA = replacerA.getPriority()
    const priorityB = replacerB.getPriority()
    if (priorityA === priorityB) {
      return 0
    } else if (priorityA < priorityB) {
      return -1
    } else {
      return 1
    }
  }

  /**
   * Resets all replacers before rendering.
   */
  public resetReplacers(): void {
    this.replacers.forEach((replacer) => replacer.reset())
  }

  /**
   * Converts the given {@link Node} to a React element.
   *
   * @param node The {@link Node DOM node} that should be translated.
   * @param index The index of the node within its parents child list.
   * @return the created react element
   */
  public translateNodeToReactElement(node: Node, index: number | string): ValidReactDomElement {
    return isTag(node)
      ? this.translateElementToReactElement(node, index)
      : convertNodeToReactElement(node, index, this.translateNodeToReactElement.bind(this))
  }

  /**
   * Translates the given {@link Element} to a React element.
   *
   * @param element The {@link Element DOM element} that should be translated.
   * @param index The index of the element within its parents child list.
   * @return the created react element
   */
  private translateElementToReactElement(element: Element, index: number | string): ValidReactDomElement {
    const elementKey = this.calculateUniqueKey(element).orElseGet(() => `-${index}`)
    const replacement = this.findElementReplacement(element, elementKey)
    if (replacement === null) {
      return null
    } else if (replacement === DO_NOT_REPLACE) {
      return this.renderNativeNode(element, elementKey)
    } else if (typeof replacement === 'string') {
      return replacement
    } else {
      return React.cloneElement(replacement, {
        ...(replacement.props as Record<string, unknown>),
        key: elementKey
      })
    }
  }

  /**
   * Calculates the unique key for the given {@link Element}.
   *
   * @param element The element for which the unique key should be calculated.
   * @return An {@link Optional} that contains the unique key or is empty if no key could be found.
   */
  private calculateUniqueKey(element: Element): Optional<string> {
    if (!element.attribs) {
      return Optional.empty()
    }

    return Optional.ofNullable(element.prev)
      .map((lineMarker) => NodeToReactTransformer.extractLineIndexFromLineMarker(lineMarker))
      .map(([startLineIndex, endLineIndex]) =>
        NodeToReactTransformer.convertMarkdownItLineIndexesToInternalLineIndexes(startLineIndex, endLineIndex)
      )
      .flatMap((adjustedLineIndexes) => this.findLineIdsByIndex(adjustedLineIndexes))
      .map(([startLine, endLine]) => `${startLine.id}_${endLine.id}`)
  }

  /**
   * Asks every saved replacer if the given {@link Element element} should be
   * replaced with another react element or not.
   *
   * @param element The {@link Element} that should be checked.
   * @param elementKey The unique key for the element
   * @return The replacement or {@link DO_NOT_REPLACE} if the element shouldn't be replaced with a custom component.
   */
  private findElementReplacement(element: Element, elementKey: string): NodeReplacement {
    const transformer = this.translateNodeToReactElement.bind(this)
    const nativeRenderer = () => this.renderNativeNode(element, elementKey)
    for (const componentReplacer of this.replacers) {
      const replacement = componentReplacer.replace(element, transformer, nativeRenderer)
      if (replacement !== DO_NOT_REPLACE) {
        return replacement
      }
    }
    return DO_NOT_REPLACE
  }

  /**
   * Extracts the start and end line indexes that are saved in a line marker element
   * and describe in which line, in the Markdown code, the node before the marker ends
   * and which the node after the marker starts.
   *
   * @param lineMarker The line marker that saves a start and end line index.
   * @return the extracted line indexes
   */
  private static extractLineIndexFromLineMarker(lineMarker: Node): LineIndexPair | undefined {
    if (!isTag(lineMarker) || lineMarker.tagName !== LinemarkerMarkdownExtension.tagName || !lineMarker.attribs) {
      return
    }
    const startLineInMarkdown = lineMarker.attribs['data-start-line']
    const endLineInMarkdown = lineMarker.attribs['data-end-line']
    if (startLineInMarkdown === undefined || endLineInMarkdown === undefined) {
      return
    }

    const startLineIndex = Number(startLineInMarkdown)
    const endLineIndex = Number(endLineInMarkdown)

    if (isNaN(startLineIndex) || isNaN(endLineIndex)) {
      return
    }

    return [startLineIndex, endLineIndex]
  }

  /**
   * Converts markdown-it line indexes to internal line indexes.
   * The differences are:
   *   - Markdown it starts to count at 1, but we start at 0
   *   - Line indexes in markdown-it are start(inclusive) to end(exclusive). But we need start(inclusive) to end(inclusive).
   *
   * @param startLineIndex The start line index from markdown it
   * @param endLineIndex The end line index from markdown it
   * @return The adjusted start and end line index
   */
  private static convertMarkdownItLineIndexesToInternalLineIndexes(
    startLineIndex: number,
    endLineIndex: number
  ): LineIndexPair {
    return [startLineIndex - 1, endLineIndex - 2]
  }

  /**
   * Renders the given node without any replacement
   *
   * @param node The node to render
   * @param key The unique key for the node
   * @return The rendered {@link ValidReactDomElement}
   */
  private renderNativeNode = (node: Element, key: string): ValidReactDomElement => {
    if (node.attribs === undefined) {
      node.attribs = {}
    }

    return convertNodeToReactElement(node, key, this.translateNodeToReactElement.bind(this))
  }

  private findLineIdsByIndex([startLineIndex, endLineIndex]: LineIndexPair): Optional<[LineWithId, LineWithId]> {
    const startLine = this.lineIds[startLineIndex]
    const endLine = this.lineIds[endLineIndex]
    return startLine === undefined || endLine === undefined ? Optional.empty() : Optional.of([startLine, endLine])
  }
}
