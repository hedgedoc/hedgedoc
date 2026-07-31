/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEditorToRendererCommunicator } from '../../../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import type { CommunicationMessages, RendererToEditorMessageType } from '../rendering-message'
import type { Handler } from '../window-post-message-communicator'
import { useEffect } from 'react'

type EditorMessageHandler<MESSAGE_TYPE extends RendererToEditorMessageType> = Handler<
  CommunicationMessages,
  MESSAGE_TYPE
> | null

/**
 * Sets the handler for the given message type in the current editor to renderer communicator.
 *
 * @param messageType The message type that should be used to listen to.
 * @param handler The handler that should be called if a message with the given message type was received.
 */
export const useEditorReceiveHandler = <MESSAGE_TYPE extends RendererToEditorMessageType>(
  messageType: MESSAGE_TYPE,
  handler: EditorMessageHandler<MESSAGE_TYPE>
): void => {
  const editorToRendererCommunicator = useEditorToRendererCommunicator()
  useEffect(() => {
    if (!handler) {
      return
    }
    editorToRendererCommunicator.on(messageType, handler)
    return () => editorToRendererCommunicator.off(messageType, handler)
  }, [editorToRendererCommunicator, handler, messageType])
}
