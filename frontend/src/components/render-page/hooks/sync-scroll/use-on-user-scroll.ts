/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ScrollState } from '../../../editor-page/synced-scroll/scroll-props'
import type { LineMarkerPosition } from '../../../markdown-renderer/extensions/linemarker/types'
import type React from 'react'
import { useCallback } from 'react'

/**
 * Provides a callback to handle user scrolling.
 *
 * @param lineMarks An array of the current {@link LineMarkerPosition LineMarkerPositions}
 * @param scrollContainer The container to scroll in
 * @param onScroll A callback that posts new scroll states.
 * @return A callback that can be called when the user is scrolling.
 */
export const useOnUserScroll = (
  lineMarks: LineMarkerPosition[] | undefined,
  scrollContainer: React.RefObject<HTMLElement>,
  onScroll: ((newScrollState: ScrollState) => void) | null
): React.UIEventHandler<HTMLElement> => {
  return useCallback(() => {
    if (!scrollContainer.current || !lineMarks || lineMarks.length === 0 || !onScroll) {
      return
    }

    const scrollTop = scrollContainer.current.scrollTop

    const lineMarksBeforeScrollTop = lineMarks.filter((lineMark) => lineMark.position <= scrollTop)
    if (lineMarksBeforeScrollTop.length === 0) {
      return
    }

    const lineMarksAfterScrollTop = lineMarks.filter((lineMark) => lineMark.position > scrollTop)
    if (lineMarksAfterScrollTop.length === 0) {
      return
    }

    const beforeLineMark = lineMarksBeforeScrollTop.reduce((prevLineMark, currentLineMark) =>
      prevLineMark.line >= currentLineMark.line ? prevLineMark : currentLineMark
    )

    const afterLineMark = lineMarksAfterScrollTop.reduce((prevLineMark, currentLineMark) =>
      prevLineMark.line < currentLineMark.line ? prevLineMark : currentLineMark
    )

    const componentHeight = afterLineMark.position - beforeLineMark.position
    const distanceToBefore = scrollTop - beforeLineMark.position
    const percentageRaw = distanceToBefore / componentHeight
    const lineCount = afterLineMark.line - beforeLineMark.line
    const line = Math.floor(lineCount * percentageRaw + beforeLineMark.line)
    const lineHeight = componentHeight / lineCount
    const innerScrolling = Math.floor(((distanceToBefore % lineHeight) / lineHeight) * 100)

    const newScrollState: ScrollState = { firstLineInView: line, scrolledPercentage: innerScrolling }
    onScroll(newScrollState)
  }, [lineMarks, onScroll, scrollContainer])
}
