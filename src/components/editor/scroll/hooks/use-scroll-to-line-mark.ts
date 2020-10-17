import { RefObject, useCallback, useEffect, useRef } from 'react'
import { LineMarkerPosition } from '../../../markdown-renderer/types'
import { ScrollState } from '../scroll-props'
import { findLineMarks } from '../utils'

export const useScrollToLineMark = (scrollState: ScrollState | undefined, lineMarks: LineMarkerPosition[] | undefined, contentLineCount: number, renderer: RefObject<HTMLElement>): void => {
  const lastScrollPosition = useRef<number>()

  const scrollTo = useCallback((targetPosition: number): void => {
    if (!renderer.current || targetPosition === lastScrollPosition.current) {
      return
    }
    lastScrollPosition.current = targetPosition
    renderer.current.scrollTo({
      top: targetPosition
    })
  }, [renderer])

  useEffect(() => {
    if (!renderer.current || !lineMarks || lineMarks.length === 0 || !scrollState) {
      return
    }
    if (scrollState.firstLineInView < lineMarks[0].line) {
      scrollTo(0)
      return
    }
    if (scrollState.firstLineInView > lineMarks[lineMarks.length - 1].line) {
      scrollTo(renderer.current.offsetHeight)
      return
    }
    const { lastMarkBefore, firstMarkAfter } = findLineMarks(lineMarks, scrollState.firstLineInView)
    const positionBefore = lastMarkBefore ? lastMarkBefore.position : lineMarks[0].position
    const positionAfter = firstMarkAfter ? firstMarkAfter.position : renderer.current.offsetHeight
    const lastMarkBeforeLine = lastMarkBefore ? lastMarkBefore.line : 1
    const firstMarkAfterLine = firstMarkAfter ? firstMarkAfter.line : contentLineCount
    const linesBetweenMarkers = firstMarkAfterLine - lastMarkBeforeLine
    const blockHeight = positionAfter - positionBefore
    const lineHeight = blockHeight / linesBetweenMarkers
    const position = positionBefore + (scrollState.firstLineInView - lastMarkBeforeLine) * lineHeight + scrollState.scrolledPercentage / 100 * lineHeight
    const correctedPosition = Math.floor(position)
    scrollTo(correctedPosition)
  }, [contentLineCount, lineMarks, renderer, scrollState, scrollTo])
}
