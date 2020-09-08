import { DomElement } from 'domhandler'
import React, { Fragment, ReactElement } from 'react'
import { convertNodeToElement, Transform } from 'react-html-parser'
import {
  ComponentReplacer,
  SubNodeTransform
} from '../replace-components/ComponentReplacer'
import { LineKeys } from '../types'

export interface TextDifferenceResult {
  lines: LineKeys[],
  lastUsedLineId: number
}

export const calculateKeyFromLineMarker = (node: DomElement, lineKeys?: LineKeys[]): number|undefined => {
  if (!node.attribs || lineKeys === undefined) {
    return
  }

  const key = node.attribs['data-key']
  if (key) {
    return Number(key)
  }

  const lineMarker = node.prev
  if (!lineMarker || !lineMarker.attribs) {
    return
  }

  const lineInMarkdown = lineMarker.attribs['data-start-line']
  if (lineInMarkdown === undefined) {
    return
  }

  const line = Number(lineInMarkdown)
  if (lineKeys[line] === undefined) {
    return
  }

  return lineKeys[line].id
}

export const findNodeReplacement = (node: DomElement, index: number, allReplacers: ComponentReplacer[], subNodeTransform: SubNodeTransform): ReactElement|null|undefined => {
  return allReplacers
    .map((componentReplacer) => componentReplacer.getReplacement(node, subNodeTransform))
    .find((replacement) => replacement !== undefined)
}

export const renderNativeNode = (node: DomElement, key: number, transform: Transform): ReactElement => {
  if (node.attribs === undefined) {
    node.attribs = {}
  }

  delete node.attribs['data-key']
  return convertNodeToElement(node, key, transform)
}

export const buildTransformer = (lineKeys: (LineKeys[] | undefined), allReplacers: ComponentReplacer[]):Transform => {
  const transform: Transform = (node, index) => {
    const nativeRenderer = (subNode: DomElement, subKey: number) => renderNativeNode(subNode, subKey, transform)
    const subNodeTransform:SubNodeTransform = (subNode, subIndex) => transform(subNode, subIndex, transform)

    const key = calculateKeyFromLineMarker(node, lineKeys) ?? -index
    const tryReplacement = findNodeReplacement(node, key, allReplacers, subNodeTransform)
    if (tryReplacement === null) {
      return null
    } else if (tryReplacement === undefined) {
      return nativeRenderer(node, key)
    } else {
      return <Fragment key={key}>{tryReplacement}</Fragment>
    }
  }
  return transform
}
