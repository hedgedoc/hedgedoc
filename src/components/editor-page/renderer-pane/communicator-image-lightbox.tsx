/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useState } from 'react'
import { ImageLightboxModal } from '../../markdown-renderer/markdown-extension/image/image-lightbox-modal'
import type {
  ImageClickedMessage,
  ImageDetails
} from '../../render-page/window-post-message-communicator/rendering-message'
import { CommunicationMessageType } from '../../render-page/window-post-message-communicator/rendering-message'
import { useEditorReceiveHandler } from '../../render-page/window-post-message-communicator/hooks/use-editor-receive-handler'

export const CommunicatorImageLightbox: React.FC = () => {
  const [lightboxDetails, setLightboxDetails] = useState<ImageDetails | undefined>(undefined)
  const [show, setShow] = useState<boolean>(false)

  useEditorReceiveHandler(
    CommunicationMessageType.IMAGE_CLICKED,
    useCallback(
      (values: ImageClickedMessage) => {
        setLightboxDetails?.(values.details)
        setShow(true)
      },
      [setLightboxDetails]
    )
  )

  const hideLightbox = useCallback(() => {
    setShow(false)
  }, [])

  return (
    <ImageLightboxModal
      show={show}
      onHide={hideLightbox}
      src={lightboxDetails?.src}
      alt={lightboxDetails?.alt}
      title={lightboxDetails?.title}
    />
  )
}
