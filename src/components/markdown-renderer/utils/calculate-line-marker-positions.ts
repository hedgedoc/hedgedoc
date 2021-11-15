/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import equal from 'fast-deep-equal'
import type { RefObject } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import useResizeObserver from 'use-resize-observer'
import type { LineMarkerPosition } from '../markdown-extension/linemarker/types'
import type { LineMarkers } from '../markdown-extension/linemarker/add-line-marker-markdown-it-plugin'

export const calculateLineMarkerPositions = (
  documentElement: HTMLDivElement,
  currentLineMarkers: LineMarkers[],
  offset?: number
): LineMarkerPosition[] => {
  const lineMarkers = currentLineMarkers
  const children: HTMLCollection = documentElement.children
  const lineMarkerPositions: LineMarkerPosition[] = []

  Array.from(children).forEach((child, childIndex) => {
    const htmlChild = child as HTMLElement
    if (htmlChild.offsetTop === undefined) {
      return
    }
    const currentLineMarker = lineMarkers[childIndex]
    if (currentLineMarker === undefined) {
      return
    }

    const lastPosition = lineMarkerPositions[lineMarkerPositions.length - 1]
    if (!lastPosition || lastPosition.line !== currentLineMarker.startLine) {
      lineMarkerPositions.push({
        line: currentLineMarker.startLine,
        position: htmlChild.offsetTop + (offset ?? 0)
      })
    }

    lineMarkerPositions.push({
      line: currentLineMarker.endLine,
      position: htmlChild.offsetTop + htmlChild.offsetHeight + (offset ?? 0)
    })
  })

  return lineMarkerPositions
}

export const useCalculateLineMarkerPosition = (
  documentElement: RefObject<HTMLDivElement>,
  lineMarkers?: LineMarkers[],
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void,
  offset?: number
): void => {
  const lastLineMarkerPositions = useRef<LineMarkerPosition[]>()

  const calculateNewLineMarkerPositions = useCallback(() => {
    if (!documentElement.current || !onLineMarkerPositionChanged || !lineMarkers) {
      return
    }

    const newLines = calculateLineMarkerPositions(documentElement.current, lineMarkers, offset)

    if (!equal(newLines, lastLineMarkerPositions)) {
      lastLineMarkerPositions.current = newLines
      onLineMarkerPositionChanged(newLines)
    }
  }, [documentElement, lineMarkers, offset, onLineMarkerPositionChanged])

  useEffect(() => {
    calculateNewLineMarkerPositions()
  }, [calculateNewLineMarkerPositions])

  useResizeObserver({
    ref: documentElement,
    onResize: () => calculateNewLineMarkerPositions()
  })
}
