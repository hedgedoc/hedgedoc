/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type React from 'react'
import { useCallback } from 'react'
import type { ImageClickHandler } from '../../markdown-renderer/markdown-extension/image/proxy-image-replacer'
import type { RendererToEditorCommunicator } from '../window-post-message-communicator/renderer-to-editor-communicator'
import { CommunicationMessageType } from '../window-post-message-communicator/rendering-message'

/**
 * Generates a callback to send information about a clicked image from the iframe back to the editor.
 *
 * @param iframeCommunicator The communicator to send the message with.
 * @return The callback to give to on onClick handler
 */
export const useImageClickHandler = (iframeCommunicator: RendererToEditorCommunicator): ImageClickHandler => {
  return useCallback(
    (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
      const image = event.target as HTMLImageElement
      if (image.src === '') {
        return
      }
      iframeCommunicator.sendMessageToOtherSide({
        type: CommunicationMessageType.IMAGE_CLICKED,
        details: {
          src: image.src,
          alt: image.alt,
          title: image.title
        }
      })
    },
    [iframeCommunicator]
  )
}
