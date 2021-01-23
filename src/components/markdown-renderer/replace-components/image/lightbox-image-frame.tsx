/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { Fragment, useState } from 'react'
import { ImageLightboxModal } from './image-lightbox-modal'
import "./lightbox.scss"

export const LightboxImageFrame: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (
  {
    alt,
    title,
    src,
    ...props
  }) => {
  const [showFullscreenImage, setShowFullscreenImage] = useState(false)

  return (
    <Fragment>
      <img alt={alt} src={src} title={title} {...props} className={'cursor-zoom-in'}
           onClick={() => setShowFullscreenImage(true)}/>
      <ImageLightboxModal
        show={showFullscreenImage}
        onHide={() => setShowFullscreenImage(false)} title={title} src={src} alt={alt}/>
    </Fragment>
  )
}
