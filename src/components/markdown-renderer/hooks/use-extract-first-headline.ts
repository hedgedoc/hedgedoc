/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type React from 'react'
import { useCallback, useRef } from 'react'

/**
 * Extracts the plain text content of a {@link ChildNode node}.
 *
 * @param node The node whose text content should be extracted.
 * @return the plain text content
 */
const extractInnerText = (node: ChildNode | null): string => {
  if (!node) {
    return ''
  } else if (isKatexMathMlElement(node)) {
    return ''
  } else if (node.childNodes && node.childNodes.length > 0) {
    return extractInnerTextFromChildren(node)
  } else if (node.nodeName.toLowerCase() === 'img') {
    return (node as HTMLImageElement).getAttribute('alt') ?? ''
  } else {
    return node.textContent ?? ''
  }
}

/**
 * Determines if the given {@link ChildNode node} is the mathml part of a KaTeX rendering.
 * @param node The node that might be a katex mathml element
 */
const isKatexMathMlElement = (node: ChildNode): boolean => (node as HTMLElement).classList?.contains('katex-mathml')

/**
 * Extracts the text content of the children of the given {@link ChildNode node}.
 * @param node The node whose children should be processed. The content of the node itself won't be included.
 * @return the concatenated text content of the child nodes
 */
const extractInnerTextFromChildren = (node: ChildNode): string =>
  Array.from(node.childNodes).reduce((state, child) => {
    return state + extractInnerText(child)
  }, '')

/**
 * Extracts the plain text content of the first level 1 heading in the document.
 *
 * @param documentElement The root element of (sub)dom that should be inspected
 * @param onFirstHeadingChange A callback that will be executed with the new level 1 heading
 */
export const useExtractFirstHeadline = (
  documentElement: React.RefObject<HTMLDivElement>,
  onFirstHeadingChange?: (firstHeading: string | undefined) => void
): (() => void) => {
  const lastFirstHeading = useRef<string | undefined>()

  return useCallback(() => {
    if (!onFirstHeadingChange || !documentElement.current) {
      return
    }
    const firstHeading = documentElement.current.getElementsByTagName('h1').item(0)
    const headingText = extractInnerText(firstHeading).trim()
    if (headingText !== lastFirstHeading.current) {
      lastFirstHeading.current = headingText
      onFirstHeadingChange(headingText)
    }
  }, [documentElement, onFirstHeadingChange])
}
