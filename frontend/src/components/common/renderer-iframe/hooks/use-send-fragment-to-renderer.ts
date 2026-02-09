/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEditorToRendererCommunicator } from '../../../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useEffect } from 'react'

/**
 * Sends the URL hash (fragment) to the renderer iframe for scrolling to the relevant heading
 *
 * @param rendererReady Defines if the target renderer is ready
 */
export const useSendFragmentToRenderer = (rendererReady: boolean): void => {
  const iframeCommunicator = useEditorToRendererCommunicator()

  useEffect(() => {
    if (!rendererReady || !iframeCommunicator) {
      return
    }

    const sendFragment = (): void => {
      const hash = window.location.hash
      if (hash.length <= 1) {
        return
      }
      const elementId = hash.substring(1)
      iframeCommunicator.sendMessageToOtherSide({
        type: CommunicationMessageType.SCROLL_TO_ELEMENT,
        elementId
      })
    }

    // timeout is required to wait for the renderer to be ready to scroll
    const timeoutId = setTimeout(sendFragment, 100)

    window.addEventListener('hashchange', sendFragment)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('hashchange', sendFragment)
    }
  }, [iframeCommunicator, rendererReady])
}
