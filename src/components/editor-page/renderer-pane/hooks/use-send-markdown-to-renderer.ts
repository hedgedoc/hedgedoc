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
 * @param markdownContentLines The markdown content to send.
 */
export const useSendMarkdownToRenderer = (markdownContentLines: string[]): void => {
  return useSendToRenderer(
    useMemo(
      () => ({
        type: CommunicationMessageType.SET_MARKDOWN_CONTENT,
        content: markdownContentLines
      }),
      [markdownContentLines]
    )
  )
}
