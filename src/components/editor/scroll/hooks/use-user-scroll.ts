import { RefObject, useCallback } from 'react'
import { LineMarkerPosition } from '../../../markdown-renderer/types'
import { ScrollState } from '../scroll-props'

export const useUserScroll = (lineMarks: LineMarkerPosition[] | undefined, renderer: RefObject<HTMLElement>, onScroll: ((newScrollState: ScrollState) => void)|undefined): () => void =>
  useCallback(() => {
    if (!renderer.current || !lineMarks || lineMarks.length === 0 || !onScroll) {
      return
    }

    const scrollTop = renderer.current.scrollTop

    const lineMarksBeforeScrollTop = lineMarks.filter(lineMark => lineMark.position <= scrollTop)
    if (lineMarksBeforeScrollTop.length === 0) {
      return
    }

    const lineMarksAfterScrollTop = lineMarks.filter(lineMark => lineMark.position > scrollTop)
    if (lineMarksAfterScrollTop.length === 0) {
      return
    }

    const beforeLineMark = lineMarksBeforeScrollTop
      .reduce((prevLineMark, currentLineMark) =>
        prevLineMark.line >= currentLineMark.line ? prevLineMark : currentLineMark)

    const afterLineMark = lineMarksAfterScrollTop
      .reduce((prevLineMark, currentLineMark) =>
        prevLineMark.line < currentLineMark.line ? prevLineMark : currentLineMark)

    const componentHeight = afterLineMark.position - beforeLineMark.position
    const distanceToBefore = scrollTop - beforeLineMark.position
    const percentageRaw = (distanceToBefore / componentHeight)
    const lineCount = afterLineMark.line - beforeLineMark.line
    const line = Math.floor(lineCount * percentageRaw + beforeLineMark.line)
    const lineHeight = componentHeight / lineCount
    const innerScrolling = Math.floor((distanceToBefore % lineHeight) / lineHeight * 100)

    const newScrollState: ScrollState = { firstLineInView: line, scrolledPercentage: innerScrolling }
    onScroll(newScrollState)
  }, [lineMarks, onScroll, renderer])
