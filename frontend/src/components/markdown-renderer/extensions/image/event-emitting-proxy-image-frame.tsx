/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ImageDetails } from '../../../render-page/window-post-message-communicator/rendering-message'
import { useExtensionEventEmitter } from '../../hooks/use-extension-event-emitter'
import { ProxyImageFrame } from './proxy-image-frame'
import React, { useCallback } from 'react'

type EventEmittingProxyImageFrameProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onClick'>

export const SHOW_IMAGE_LIGHTBOX_EVENT_NAME = 'ImageClick'

/**
 * Renders a {@link ProxyImageFrame} but claims the `onClick` event to send image information to the current event emitter.
 *
 * @param props props that will be forwarded to the inner image frame
 */
export const EventEmittingProxyImageFrame: React.FC<EventEmittingProxyImageFrameProps> = (props) => {
  const eventEmitter = useExtensionEventEmitter()

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
      const image = event.target as HTMLImageElement
      if (image.src === '') {
        return
      }
      eventEmitter?.emit(SHOW_IMAGE_LIGHTBOX_EVENT_NAME, {
        src: image.src,
        alt: image.alt,
        title: image.title
      } as ImageDetails)
    },
    [eventEmitter]
  )

  return <ProxyImageFrame {...props} onClick={onClick} />
}
