/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect } from 'react'

export const useExtractFirstHeadline = (documentElement: React.RefObject<HTMLDivElement>, content: string, onFirstHeadingChange?: (firstHeading: string | undefined) => void): void => {
  const extractInnerText = useCallback((node: ChildNode): string => {
    let innerText = ''

    if ((node as HTMLElement).classList?.contains("katex-mathml")) {
      return ''
    }

    if (node.childNodes && node.childNodes.length > 0) {
      node.childNodes.forEach((child) => { innerText += extractInnerText(child) })
    } else if (node.nodeName === 'IMG') {
      innerText += (node as HTMLImageElement).getAttribute('alt')
    } else {
      innerText += node.textContent
    }
    return innerText
  }, [])

  useEffect(() => {
    if (onFirstHeadingChange && documentElement.current) {
      const firstHeading = documentElement.current.getElementsByTagName('h1').item(0)
      if (firstHeading) {
        onFirstHeadingChange(extractInnerText(firstHeading))
      } else {
        onFirstHeadingChange(undefined)
      }
    }
  }, [documentElement, extractInnerText, onFirstHeadingChange, content])
}
