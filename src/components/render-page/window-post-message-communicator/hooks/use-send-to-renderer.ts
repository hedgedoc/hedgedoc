/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'
import type { CommunicationMessages, EditorToRendererMessageType } from '../rendering-message'
import { useEditorToRendererCommunicator } from '../../../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import type { MessagePayload } from '../window-post-message-communicator'

/**
 * Sends the given message to the renderer.
 *
 * @param message The message to send
 * @param rendererReady Defines if the target renderer is ready
 */
export const useSendToRenderer = (
  message: undefined | Extract<CommunicationMessages, MessagePayload<EditorToRendererMessageType>>,
  rendererReady: boolean
): void => {
  const iframeCommunicator = useEditorToRendererCommunicator()

  useEffect(() => {
    if (message && rendererReady) {
      iframeCommunicator.sendMessageToOtherSide(message)
    }
  }, [iframeCommunicator, message, rendererReady])
}
