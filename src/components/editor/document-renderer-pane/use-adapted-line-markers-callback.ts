/*
SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import { RefObject, useCallback } from 'react'
import { LineMarkerPosition } from '../../markdown-renderer/types'

export const useAdaptedLineMarkerCallback = (documentRenderPaneRef: RefObject<HTMLDivElement> | undefined,
                                             rendererRef: RefObject<HTMLDivElement>,
                                             onLineMarkerPositionChanged: ((lineMarkerPosition: LineMarkerPosition[]) => void) | undefined): ((lineMarkerPosition: LineMarkerPosition[]) => void) => {
  return useCallback((linkMarkerPositions) => {
    if (!onLineMarkerPositionChanged || !documentRenderPaneRef || !documentRenderPaneRef.current || !rendererRef.current) {
      return
    }
    const documentRenderPaneTop = (documentRenderPaneRef.current.offsetTop ?? 0)
    const rendererTop = (rendererRef.current.offsetTop ?? 0)
    const offset = rendererTop - documentRenderPaneTop
    onLineMarkerPositionChanged(linkMarkerPositions.map(oldMarker => ({
      line: oldMarker.line,
      position: oldMarker.position + offset
    })))
  }, [documentRenderPaneRef, onLineMarkerPositionChanged, rendererRef])
}
