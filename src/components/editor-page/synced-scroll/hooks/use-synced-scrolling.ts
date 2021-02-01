/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState } from 'react'
import { LineMarkerPosition } from '../../../markdown-renderer/types'
import { ScrollState } from '../scroll-props'
import { useOnUserScroll } from './use-on-user-scroll'
import { useScrollToLineMark } from './use-scroll-to-line-mark'

export const useSyncedScrolling = (outerContainerRef: React.RefObject<HTMLElement>,
                                   rendererRef: React.RefObject<HTMLElement>,
                                   numberOfLines: number,
                                   scrollState?: ScrollState,
                                   onScroll?: (scrollState: ScrollState) => void): [(lineMarkers: LineMarkerPosition[]) => void, () => void] => {
  const [lineMarks, setLineMarks] = useState<LineMarkerPosition[]>()

  const onLineMarkerPositionChanged = useCallback((linkMarkerPositions: LineMarkerPosition[]) => {
    if (!outerContainerRef.current || !rendererRef.current) {
      return
    }
    const documentRenderPaneTop = (outerContainerRef.current.offsetTop ?? 0)
    const rendererTop = (rendererRef.current.offsetTop ?? 0)
    const offset = rendererTop - documentRenderPaneTop
    const adjustedLineMakerPositions = linkMarkerPositions.map(oldMarker => ({
      line: oldMarker.line,
      position: oldMarker.position + offset
    }))
    setLineMarks(adjustedLineMakerPositions)
  }, [outerContainerRef, rendererRef])

  const onUserScroll = useOnUserScroll(lineMarks, outerContainerRef, onScroll)
  useScrollToLineMark(scrollState, lineMarks, numberOfLines, outerContainerRef)

  return [onLineMarkerPositionChanged, onUserScroll]
}
