/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { RefObject, useCallback, useRef } from 'react'
import { IframeEditorToRendererCommunicator } from '../../../render-page/iframe-editor-to-renderer-communicator'

export const useOnIframeLoad = (frameReference: RefObject<HTMLIFrameElement>, iframeCommunicator: IframeEditorToRendererCommunicator,
  rendererOrigin: string, renderPageUrl: string, onNavigateAway: () => void): () => void => {
  const sendToRenderPage = useRef<boolean>(true)

  return useCallback(() => {
    const frame = frameReference.current
    if (!frame || !frame.contentWindow) {
      iframeCommunicator.unsetOtherSide()
      return
    }

    if (sendToRenderPage.current) {
      iframeCommunicator.setOtherSide(frame.contentWindow, rendererOrigin)
      sendToRenderPage.current = false
      return
    } else {
      onNavigateAway()
      console.error('Navigated away from unknown URL')
      frame.src = renderPageUrl
      sendToRenderPage.current = true
    }
  }, [frameReference, iframeCommunicator, onNavigateAway, renderPageUrl, rendererOrigin])
}
