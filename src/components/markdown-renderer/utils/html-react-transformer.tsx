/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DomElement } from 'domhandler'
import React, { ReactElement, Suspense } from 'react'
import { convertNodeToElement, Transform } from 'react-html-parser'
import { ComponentReplacer, NativeRenderer, SubNodeTransform } from '../replace-components/ComponentReplacer'
import { LineKeys } from '../types'

export interface TextDifferenceResult {
  lines: LineKeys[],
  lastUsedLineId: number
}

export const calculateKeyFromLineMarker = (node: DomElement, lineKeys?: LineKeys[]): string|undefined => {
  if (!node.attribs || lineKeys === undefined) {
    return
  }

  const key = node.attribs['data-key']
  if (key) {
    return key
  }

  const lineMarker = node.prev
  if (!lineMarker || !lineMarker.attribs) {
    return
  }

  const startLineInMarkdown = lineMarker.attribs['data-start-line']
  const endLineInMarkdown = lineMarker.attribs['data-end-line']
  if (startLineInMarkdown === undefined || endLineInMarkdown === undefined) {
    return
  }

  const startLine = Number(startLineInMarkdown)
  const endLine = Number(endLineInMarkdown)
  if (lineKeys[startLine] === undefined || lineKeys[endLine] === undefined) {
    return
  }

  return `${lineKeys[startLine].id}_${lineKeys[endLine].id}`
}

export const findNodeReplacement = (node: DomElement, key: string, allReplacers: ComponentReplacer[], subNodeTransform: SubNodeTransform, nativeRenderer: NativeRenderer): ReactElement | null | undefined => {
  return allReplacers
    .map((componentReplacer) => componentReplacer.getReplacement(node, subNodeTransform, nativeRenderer))
    .find((replacement) => replacement !== undefined)
}

export const renderNativeNode = (node: DomElement, key: string, transform: Transform): ReactElement => {
  if (node.attribs === undefined) {
    node.attribs = {}
  }

  delete node.attribs['data-key']
  return convertNodeToElement(node, key as unknown as number, transform)
}

export const buildTransformer = (lineKeys: (LineKeys[] | undefined), allReplacers: ComponentReplacer[]):Transform => {
  const transform: Transform = (node, index) => {
    const nativeRenderer: NativeRenderer = () => renderNativeNode(node, key, transform)
    const subNodeTransform: SubNodeTransform = (subNode, subIndex) => transform(subNode, subIndex, transform)

    const key = calculateKeyFromLineMarker(node, lineKeys) ?? (-index).toString()
    const tryReplacement = findNodeReplacement(node, key, allReplacers, subNodeTransform, nativeRenderer)
    if (tryReplacement === null) {
      return null
    } else if (tryReplacement === undefined) {
      return nativeRenderer()
    } else {
      return <Suspense key={key} fallback={<span>Loading...</span>}>
        {tryReplacement}
      </Suspense>
    }
  }
  return transform
}
