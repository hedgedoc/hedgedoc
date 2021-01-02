/*
SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
*/

import React, { Fragment, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'

export const LightboxedImageFrame: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ alt, ...props }) => {
  const [showFullscreenImage, setShowFullscreenImage] = useState(false)

  return (
    <Fragment>
      <img alt={alt} {...props} className={'cursor-zoom-in'} onClick={() => setShowFullscreenImage(true)}/>
      <Modal
        animation={true}
        centered={true}
        dialogClassName={'text-dark'}
        show={showFullscreenImage}
        onHide={() => setShowFullscreenImage(false)}
        size={'xl'}>
        <Modal.Header closeButton={true}>
          <Modal.Title className={'h6'}>
            <ForkAwesomeIcon icon={'picture-o'}/>
            &nbsp;
            <span>{alt ?? ''}</span>
          </Modal.Title>
        </Modal.Header>
        <img alt={alt} {...props} className={'w-100 cursor-zoom-out'} onClick={() => setShowFullscreenImage(false)}/>
      </Modal>
    </Fragment>
  )
}
