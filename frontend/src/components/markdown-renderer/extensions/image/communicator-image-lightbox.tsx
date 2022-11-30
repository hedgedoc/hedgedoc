/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import type { ImageDetails } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useExtensionEventEmitterHandler } from '../../hooks/use-extension-event-emitter'
import { SHOW_IMAGE_LIGHTBOX_EVENT_NAME } from './event-emitting-proxy-image-frame'
import { ImageLightboxModal } from './image-lightbox-modal'
import React, { useCallback, useState } from 'react'

/**
 * Handles messages from the render in the iframe to open a {@link ImageLightboxModal}.
 */
export const CommunicatorImageLightbox: React.FC = () => {
  const [lightboxDetails, setLightboxDetails] = useState<ImageDetails | undefined>(undefined)
  const [modalVisibility, showModal, closeModal] = useBooleanState()

  const handler = useCallback(
    (values: ImageDetails) => {
      setLightboxDetails?.(values)
      showModal()
    },
    [showModal]
  )

  useExtensionEventEmitterHandler(SHOW_IMAGE_LIGHTBOX_EVENT_NAME, handler)

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
