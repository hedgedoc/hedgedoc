/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Modal } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../../common/fork-awesome/fork-awesome-icon'
import './lightbox.scss'
import { ProxyImageFrame } from './proxy-image-frame'

export interface ImageLightboxModalProps {
  show: boolean
  onHide: () => void
  alt?: string
  src?: string
  title?: string
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ show, onHide, src, alt, title }) => {
  return (
    <Modal
      animation={true}
      centered={true}
      dialogClassName={'text-dark lightbox'}
      show={show && !!src}
      onHide={onHide}
      size={'xl'}>
      <Modal.Header closeButton={true}>
        <Modal.Title className={'h6'}>
          <ForkAwesomeIcon icon={'picture-o'} />
          &nbsp;
          <span>{alt ?? title ?? ''}</span>
        </Modal.Title>
      </Modal.Header>
      <ProxyImageFrame alt={alt} src={src} title={title} className={'w-100 cursor-zoom-out'} onClick={onHide} />
    </Modal>
  )
}
