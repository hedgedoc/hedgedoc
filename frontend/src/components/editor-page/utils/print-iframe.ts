/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useIsRendererReady } from '../../render-page/window-post-message-communicator/hooks/use-is-renderer-ready'
import { useCallback } from 'react'
import { setPrintMode } from '../../../redux/print-mode/methods'
import { useEditorToRendererCommunicator } from '../render-context/editor-to-renderer-communicator-context-provider'
import { CommunicationMessageType } from '../../render-page/window-post-message-communicator/rendering-message'

const TIMEOUT_BEFORE_PRINT = 25

/**
 * Prints the content of the renderer iframe.
 */
export const usePrintIframe = (): (() => void) => {
  const iframeCommunicator = useEditorToRendererCommunicator()
  const rendererReady = useIsRendererReady()

  return useCallback(() => {
    if (!rendererReady) {
      return
    }

    const iframe = document.getElementById('editor-renderer-iframe') as HTMLIFrameElement
    if (!iframe || !iframe.contentWindow) {
      return
    }
    iframeCommunicator?.sendMessageToOtherSide({
      type: CommunicationMessageType.SET_PRINT_MODE,
      printMode: true
    })
    setTimeout(() => {
      iframe.contentWindow?.print()
      iframeCommunicator?.sendMessageToOtherSide({
        type: CommunicationMessageType.SET_PRINT_MODE,
        printMode: false
      })
    }, TIMEOUT_BEFORE_PRINT)
  }, [rendererReady, iframeCommunicator])
}

/**
 * Print the content of the iframe from within the iframe.
 *
 * This should only be called if you're sure you are in the iframe e.g. `window.top === window.self`
 */
export const usePrintSelf = () => {
  return useCallback(() => {
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setPrintMode(false)
    }, TIMEOUT_BEFORE_PRINT)
  }, [])
}
