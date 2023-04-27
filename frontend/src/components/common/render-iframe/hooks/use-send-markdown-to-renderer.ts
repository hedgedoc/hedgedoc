/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSendToRenderer } from '../../../render-page/window-post-message-communicator/hooks/use-send-to-renderer'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useMemo } from 'react'

/**
 * Sends the given markdown content to the renderer.
 *
 * @param markdownContentLines The markdown content to send.
 * @param rendererReady Defines if the target renderer is ready
 */
export const useSendMarkdownToRenderer = (markdownContentLines: string[], rendererReady: boolean): void => {
  return useSendToRenderer(
    useMemo(
      () => ({
        type: CommunicationMessageType.SET_MARKDOWN_CONTENT,
        content: markdownContentLines
      }),
      [markdownContentLines]
    ),
    rendererReady
  )
}
