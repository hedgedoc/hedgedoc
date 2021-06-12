/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { ImageClickHandler } from '../../markdown-renderer/replace-components/image/image-replacer'
import { IframeRendererToEditorCommunicator } from '../iframe-renderer-to-editor-communicator'

export const useImageClickHandler = (
  iframeCommunicator: IframeRendererToEditorCommunicator | undefined
): ImageClickHandler => {
  return useCallback(
    (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
      const image = event.target as HTMLImageElement
      if (image.src === '') {
        return
      }
      iframeCommunicator?.sendClickedImageUrl({
        src: image.src,
        alt: image.alt,
        title: image.title
      })
    },
    [iframeCommunicator]
  )
}
