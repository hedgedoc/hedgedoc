/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ScrollState } from '../../../editor-page/synced-scroll/scroll-props'
import type { LineMarkerPosition } from '../../../markdown-renderer/extensions/linemarker/types'
import { useOnUserScroll } from './use-on-user-scroll'
import { useScrollToLineMark } from './use-scroll-to-line-mark'
import type React from 'react'
import { useCallback, useMemo, useState } from 'react'

/**
 * Synchronizes the scroll status of the given container with the given scroll state and posts changes if the user scrolls.
 *
 * @param outerContainerRef A reference for the outer container.
 * @param rendererRef A reference for the renderer
 * @param numberOfLines The number of lines
 * @param scrollState The current {@link ScrollState}
 * @param onScroll A callback that posts new scroll states
 * @return A tuple of two callbacks.
 *         The first one should be executed if the {@link LineMarkerPosition line marker positions} are updated.
 *         The second one should be executed if the user actually scrolls. Usually it should be attached to the DOM element that the user scrolls.
 */
export const useDocumentSyncScrolling = (
  outerContainerRef: React.RefObject<HTMLElement>,
  rendererRef: React.RefObject<HTMLElement>,
  numberOfLines: number,
  scrollState: ScrollState | null,
  onScroll: null | ((scrollState: ScrollState) => void)
): [(lineMarkers: LineMarkerPosition[]) => void, React.UIEventHandler<HTMLElement>] => {
  const [lineMarks, setLineMarks] = useState<LineMarkerPosition[]>([])

  const recalculateLineMarkerPositions = useCallback(
    (linkMarkerPositions: LineMarkerPosition[]) => {
      if (!outerContainerRef.current || !rendererRef.current) {
        return
      }
      const documentRenderPaneTop = outerContainerRef.current.offsetTop ?? 0
      const rendererTop = rendererRef.current.offsetTop ?? 0
      const offset = rendererTop - documentRenderPaneTop
      const adjustedLineMakerPositions = linkMarkerPositions.map((oldMarker) => ({
        line: oldMarker.line,
        position: oldMarker.position + offset
      }))
      setLineMarks(adjustedLineMakerPositions)
    },
    [outerContainerRef, rendererRef]
  )

  const onUserScroll = useOnUserScroll(lineMarks, outerContainerRef, onScroll)
  useScrollToLineMark(scrollState, lineMarks, numberOfLines, outerContainerRef)

  return useMemo(() => [recalculateLineMarkerPositions, onUserScroll], [recalculateLineMarkerPositions, onUserScroll])
}
