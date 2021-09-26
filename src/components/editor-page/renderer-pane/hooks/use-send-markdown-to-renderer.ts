/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSendToRenderer } from '../../../render-page/window-post-message-communicator/hooks/use-send-to-renderer'
import { useMemo } from 'react'
import { CommunicationMessageType } from '../../../render-page/window-post-message-communicator/rendering-message'

/**
 * Sends the given markdown content to the renderer.
 *
 * @param markdownContent The markdown content to send.
 */
export const useSendMarkdownToRenderer = (markdownContent: string): void => {
  return useSendToRenderer(
    useMemo(
      () => ({
        type: CommunicationMessageType.SET_MARKDOWN_CONTENT,
        content: markdownContent
      }),
      [markdownContent]
    )
  )
}
