/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'
import type { CommonModalProps } from './common-modal'
import { CommonModal } from './common-modal'
import { cypressId } from '../../../utils/cypress-attribute'

export interface DeletionModalProps extends CommonModalProps {
  onConfirm: () => void
  deletionButtonI18nKey: string
}

export const DeletionModal: React.FC<DeletionModalProps> = ({
  show,
  onHide,
  title,
  onConfirm,
  deletionButtonI18nKey,
  titleIcon,
  children,
  ...props
}) => {
  useTranslation()

  return (
    <CommonModal show={show} onHide={onHide} title={title} titleIcon={titleIcon} showCloseButton={true} {...props}>
      <Modal.Body className='text-dark'>{children}</Modal.Body>
      <Modal.Footer>
        <Button {...cypressId('deletionModal.confirmButton')} variant='danger' onClick={onConfirm}>
          <Trans i18nKey={deletionButtonI18nKey} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
