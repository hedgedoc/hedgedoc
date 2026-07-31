/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useRendererToEditorCommunicator } from '../../../editor-page/render-context/renderer-to-editor-communicator-context-provider'
import type { CommunicationMessages, EditorToRendererMessageType } from '../rendering-message'
import type { Handler } from '../window-post-message-communicator'
import { useEffect } from 'react'

type RendererMessageHandler<MESSAGE_TYPE extends EditorToRendererMessageType> = Handler<
  CommunicationMessages,
  MESSAGE_TYPE
>

/**
 * Sets the handler for the given message type in the current renderer to editor communicator.
 *
 * @param messageType The message type that should be used to listen to.
 * @param handler The handler that should be called if a message with the given message type was received.
 */
export const useRendererReceiveHandler = <MESSAGE_TYPE extends EditorToRendererMessageType>(
  messageType: MESSAGE_TYPE,
  handler: RendererMessageHandler<MESSAGE_TYPE>
): void => {
  const rendererToEditorCommunicator = useRendererToEditorCommunicator()
  useEffect(() => {
    if (!handler) {
      return
    }
    rendererToEditorCommunicator.on(messageType, handler)
    return () => rendererToEditorCommunicator.off(messageType, handler)
  }, [rendererToEditorCommunicator, handler, messageType])
}
