/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEditorToRendererCommunicator } from '../../../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import type { CommunicationMessages, EditorToRendererMessageType } from '../rendering-message'
import type { MessagePayload } from '../window-post-message-communicator'
import { useEffect } from 'react'

/**
 * Sends the given message to the renderer.
 *
 * @param message The message to send
 * @param rendererReady Defines if the target renderer is ready
 */
export const useSendToRenderer = (
  message: null | Extract<CommunicationMessages, MessagePayload<EditorToRendererMessageType>>,
  rendererReady: boolean
): void => {
  const iframeCommunicator = useEditorToRendererCommunicator()

  useEffect(() => {
    if (message && rendererReady) {
      iframeCommunicator?.sendMessageToOtherSide(message)
    }
  }, [iframeCommunicator, message, rendererReady])
}
