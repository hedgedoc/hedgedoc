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
 * Exports the content of the renderer iframe to PDF.
 * This opens the browser's print dialog where users can save as PDF.
 */
export const useExportToPdf = (): (() => void) => {
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

    // Set print mode for proper styling
    iframeCommunicator?.sendMessageToOtherSide({
      type: CommunicationMessageType.SET_PRINT_MODE,
      printMode: true
    })

    // Wait for print mode to be applied, then trigger print
    setTimeout(() => {
      // Trigger the print dialog
      iframe.contentWindow?.print()
      
      // Reset print mode after printing
      setTimeout(() => {
        iframeCommunicator?.sendMessageToOtherSide({
          type: CommunicationMessageType.SET_PRINT_MODE,
          printMode: false
        })
      }, 100)
    }, TIMEOUT_BEFORE_PRINT)
  }, [rendererReady, iframeCommunicator])
}

/**
 * Export to PDF from within the iframe.
 *
 * This should only be called if you're sure you are in the iframe e.g. `window.top === window.self`
 */
export const useExportToPdfSelf = () => {
  return useCallback(() => {
    setPrintMode(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => {
        setPrintMode(false)
      }, 100)
    }, TIMEOUT_BEFORE_PRINT)
  }, [])
}
