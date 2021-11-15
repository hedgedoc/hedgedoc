/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RefObject } from 'react'
import { useCallback, useEffect, useRef } from 'react'
import type { LineMarkerPosition } from '../../../markdown-renderer/markdown-extension/linemarker/types'
import type { ScrollState } from '../../../editor-page/synced-scroll/scroll-props'
import { findLineMarks } from '../../../editor-page/synced-scroll/utils'

export const useScrollToLineMark = (
  scrollState: ScrollState | undefined,
  lineMarks: LineMarkerPosition[] | undefined,
  contentLineCount: number,
  scrollContainer: RefObject<HTMLElement>
): void => {
  const lastScrollPosition = useRef<number>()

  const scrollTo = useCallback(
    (targetPosition: number): void => {
      if (!scrollContainer.current || targetPosition === lastScrollPosition.current) {
        return
      }
      lastScrollPosition.current = targetPosition
      scrollContainer.current.scrollTo({
        top: targetPosition
      })
    },
    [scrollContainer]
  )

  useEffect(() => {
    if (!scrollContainer.current || !lineMarks || lineMarks.length === 0 || !scrollState) {
      return
    }
    if (scrollState.firstLineInView < lineMarks[0].line) {
      scrollTo(0)
      return
    }
    if (scrollState.firstLineInView > lineMarks[lineMarks.length - 1].line) {
      scrollTo(scrollContainer.current.offsetHeight)
      return
    }
    const { lastMarkBefore, firstMarkAfter } = findLineMarks(lineMarks, scrollState.firstLineInView)
    const positionBefore = lastMarkBefore ? lastMarkBefore.position : lineMarks[0].position
    const positionAfter = firstMarkAfter ? firstMarkAfter.position : scrollContainer.current.offsetHeight
    const lastMarkBeforeLine = lastMarkBefore ? lastMarkBefore.line : 1
    const firstMarkAfterLine = firstMarkAfter ? firstMarkAfter.line : contentLineCount
    const linesBetweenMarkers = firstMarkAfterLine - lastMarkBeforeLine
    const blockHeight = positionAfter - positionBefore
    const lineHeight = blockHeight / linesBetweenMarkers
    const position =
      positionBefore +
      (scrollState.firstLineInView - lastMarkBeforeLine) * lineHeight +
      (scrollState.scrolledPercentage / 100) * lineHeight
    const correctedPosition = Math.floor(position)
    scrollTo(correctedPosition)
  }, [contentLineCount, lineMarks, scrollContainer, scrollState, scrollTo])
}
