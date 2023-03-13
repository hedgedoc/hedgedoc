/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { LineMarkers } from '../extensions/linemarker/add-line-marker-markdown-it-plugin'
import type { LineMarkerPosition } from '../extensions/linemarker/types'
import useResizeObserver from '@react-hook/resize-observer'
import equal from 'fast-deep-equal'
import type { RefObject } from 'react'
import { useCallback, useEffect, useRef } from 'react'

const calculateLineMarkerPositions = (
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

/**
 * Calculates the positions of the given {@link LineMarkers} in the given {@link Document}.
 *
 * @param documentElement A reference to the rendered document.
 * @param lineMarkers A list of {@link LineMarkers}
 * @param onLineMarkerPositionChanged The callback to call if the {@link LineMarkerPosition line marker positions} change e.g. by rendering or resizing.
 */
export const useCalculateLineMarkerPosition = (
  documentElement: RefObject<HTMLDivElement>,
  lineMarkers: LineMarkers[] | undefined,
  onLineMarkerPositionChanged?: (lineMarkerPosition: LineMarkerPosition[]) => void
): void => {
  const lastLineMarkerPositions = useRef<LineMarkerPosition[]>()

  const calculateNewLineMarkerPositions = useCallback(() => {
    if (!documentElement.current || !onLineMarkerPositionChanged || !lineMarkers) {
      return
    }

    const newLines = calculateLineMarkerPositions(
      documentElement.current,
      lineMarkers,
      documentElement.current.offsetTop ?? 0
    )

    if (!equal(newLines, lastLineMarkerPositions)) {
      lastLineMarkerPositions.current = newLines
      onLineMarkerPositionChanged(newLines)
    }
  }, [documentElement, lineMarkers, onLineMarkerPositionChanged])

  useEffect(() => {
    calculateNewLineMarkerPositions()
  }, [calculateNewLineMarkerPositions])

  useResizeObserver(documentElement, calculateNewLineMarkerPositions)
}
