/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
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
import { useBooleanState } from '../../../hooks/common/use-boolean-state'

/**
 * Handles messages from the render in the iframe to open a {@link ImageLightboxModal}.
 */
export const CommunicatorImageLightbox: React.FC = () => {
  const [lightboxDetails, setLightboxDetails] = useState<ImageDetails | undefined>(undefined)
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  useEditorReceiveHandler(
    CommunicationMessageType.IMAGE_CLICKED,
    useCallback(
      (values: ImageClickedMessage) => {
        setLightboxDetails?.(values.details)
        showModal()
      },
      [showModal]
    )
  )

  return (
    <ImageLightboxModal
      show={modalVisibility}
      onHide={closeModal}
      src={lightboxDetails?.src}
      alt={lightboxDetails?.alt}
      title={lightboxDetails?.title}
    />
  )
}
