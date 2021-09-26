/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { RefObject, useCallback, useRef } from 'react'
import { EditorToRendererCommunicator } from '../../../render-page/window-post-message-communicator/editor-to-renderer-communicator'

export const useOnIframeLoad = (
  frameReference: RefObject<HTMLIFrameElement>,
  iframeCommunicator: EditorToRendererCommunicator,
  rendererOrigin: string,
  renderPageUrl: string,
  onNavigateAway: () => void
): (() => void) => {
  const sendToRenderPage = useRef<boolean>(true)

  return useCallback(() => {
    const frame = frameReference.current
    if (!frame || !frame.contentWindow) {
      iframeCommunicator.unsetMessageTarget()
      return
    }

    if (sendToRenderPage.current) {
      iframeCommunicator.setMessageTarget(frame.contentWindow, rendererOrigin)
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
