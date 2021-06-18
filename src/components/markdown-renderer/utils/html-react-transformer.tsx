/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Element, isTag } from 'domhandler'
import React, { Suspense } from 'react'
import { convertNodeToReactElement } from '@hedgedoc/html-to-react/dist/convertNodeToReactElement'
import {
  ComponentReplacer,
  NativeRenderer,
  SubNodeTransform,
  ValidReactDomElement
} from '../replace-components/ComponentReplacer'
import { LineKeys } from '../types'
import { NodeToReactElementTransformer } from '@hedgedoc/html-to-react/dist/NodeToReactElementTransformer'

export interface TextDifferenceResult {
  lines: LineKeys[]
  lastUsedLineId: number
}

export const calculateKeyFromLineMarker = (node: Element, lineKeys?: LineKeys[]): string | undefined => {
  if (!node.attribs || lineKeys === undefined) {
    return
  }

  const key = node.attribs['data-key']
  if (key) {
    return key
  }

  const lineMarker = node.prev
  if (!lineMarker || !isTag(lineMarker) || !lineMarker.attribs) {
    return
  }

  const startLineInMarkdown = lineMarker.attribs['data-start-line']
  const endLineInMarkdown = lineMarker.attribs['data-end-line']
  if (startLineInMarkdown === undefined || endLineInMarkdown === undefined) {
    return
  }

  const startLineIndex = Number(startLineInMarkdown)
  const endLineIndex = Number(endLineInMarkdown)
  const startLine = lineKeys[startLineIndex - 1]
  const endLine = lineKeys[endLineIndex - 2]
  if (startLine === undefined || endLine === undefined) {
    return
  }

  return `${startLine.id}_${endLine.id}`
}

export const findNodeReplacement = (
  node: Element,
  allReplacers: ComponentReplacer[],
  subNodeTransform: SubNodeTransform,
  nativeRenderer: NativeRenderer
): ValidReactDomElement | undefined => {
  for (const componentReplacer of allReplacers) {
    const replacement = componentReplacer.getReplacement(node, subNodeTransform, nativeRenderer)
    if (replacement !== undefined) {
      return replacement
    }
  }
}

/**
 * Renders the given node without any replacement
 *
 * @param node The node to render
 * @param key The unique key for the node
 * @param transform The transform function that should be applied to the child nodes
 */
export const renderNativeNode = (
  node: Element,
  key: string,
  transform: NodeToReactElementTransformer
): ValidReactDomElement => {
  if (node.attribs === undefined) {
    node.attribs = {}
  }

  delete node.attribs['data-key']
  return convertNodeToReactElement(node, key, transform)
}

export const buildTransformer = (
  lineKeys: LineKeys[] | undefined,
  allReplacers: ComponentReplacer[]
): NodeToReactElementTransformer => {
  const transform: NodeToReactElementTransformer = (node, index) => {
    if (!isTag(node)) {
      return convertNodeToReactElement(node, index)
    }
    const nativeRenderer: NativeRenderer = () => renderNativeNode(node, key, transform)
    const subNodeTransform: SubNodeTransform = (subNode, subKey) => transform(subNode, subKey, transform)

    const key = calculateKeyFromLineMarker(node, lineKeys) ?? (-index).toString()
    const tryReplacement = findNodeReplacement(node, allReplacers, subNodeTransform, nativeRenderer)
    if (tryReplacement === null) {
      return null
    } else if (tryReplacement === undefined) {
      return nativeRenderer()
    } else {
      return (
        <Suspense key={key} fallback={<span>Loading...</span>}>
          {tryReplacement}
        </Suspense>
      )
    }
  }
  return transform
}
