/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useCallback } from 'react'
import type { CommunicationMessages, EditorToRendererMessageType } from '../rendering-message'
import { useEditorToRendererCommunicator } from '../../../editor-page/render-context/editor-to-renderer-communicator-context-provider'
import type { MessagePayload } from '../window-post-message-communicator'
import { useEffectOnRendererReady } from './use-effect-on-renderer-ready'

/**
 * Sends the given message to the renderer.
 *
 * @param message The message to send
 */
export const useSendToRenderer = (
  message: undefined | Extract<CommunicationMessages, MessagePayload<EditorToRendererMessageType>>
): void => {
  const iframeCommunicator = useEditorToRendererCommunicator()

  useEffectOnRendererReady(
    useCallback(() => {
      if (message) {
        iframeCommunicator.sendMessageToOtherSide(message)
      }
    }, [iframeCommunicator, message])
  )
}
