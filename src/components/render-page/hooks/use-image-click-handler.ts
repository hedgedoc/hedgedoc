/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { ImageClickHandler } from '../../markdown-renderer/replace-components/image/image-replacer'
import { RendererToEditorCommunicator } from '../window-post-message-communicator/renderer-to-editor-communicator'
import { CommunicationMessageType } from '../window-post-message-communicator/rendering-message'

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
