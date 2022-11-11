/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import styles from './lightbox.module.scss'
import { ProxyImageFrame } from './proxy-image-frame'
import type { ModalVisibilityProps } from '../../../common/modals/common-modal'
import { CommonModal } from '../../../common/modals/common-modal'

export interface ImageLightboxModalProps extends ModalVisibilityProps {
  alt?: string
  src?: string
  title?: string
}

/**
 * Renders a lightbox modal for images.
 *
 * @param show If the modal should be shown
 * @param onHide The callback to hide the modal
 * @param src The image source
 * @param alt The alt text of the image
 * @param title The title of the image
 */
export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({ show, onHide, src, alt, title }) => {
  return (
    <CommonModal
      modalSize={'xl'}
      show={show && !!src}
      onHide={onHide}
      showCloseButton={true}
      additionalClasses={styles.lightbox}
      title={alt ?? title ?? ''}
      titleIsI18nKey={false}>
      <ProxyImageFrame alt={alt} src={src} title={title} className={'w-100 cursor-zoom-out'} onClick={onHide} />
    </CommonModal>
  )
}
