/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useState } from 'react'
import { ImageLightboxModal } from '../../markdown-renderer/replace-components/image/image-lightbox-modal'
import { ImageDetails } from '../../render-page/rendering-message'

export interface ShowOnPropChangeImageLightboxProps {
  details?: ImageDetails
}

export const ShowOnPropChangeImageLightbox: React.FC<ShowOnPropChangeImageLightboxProps> = ({ details }) => {
  const [show, setShow] = useState<boolean>(false)

  const hideLightbox = useCallback(() => {
    setShow(false)
  }, [])

  useEffect(() => {
    if (details) {
      setShow(true)
    }
  }, [details])

  return (
    <ImageLightboxModal show={ show } onHide={ hideLightbox } src={ details?.src }
                        alt={ details?.alt } title={ details?.title }/>
  )
}
