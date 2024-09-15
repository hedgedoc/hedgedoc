/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../utils/cypress-attribute'
import type { CommonModalProps } from './common-modal'
import { CommonModal } from './common-modal'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Button, Modal } from 'react-bootstrap'
import { Trans, useTranslation } from 'react-i18next'

export interface DeletionModalProps extends CommonModalProps {
  onConfirm: () => void
  deletionButtonI18nKey: string
  disabled?: boolean
  footerContent?: React.ReactNode
}

/**
 * Renders a generic modal for deletion.
 * This means in addition to most things for the {@link CommonModal} there is also a button to confirm the deletion and a corresponding callback.
 *
 * @param show If the modal should be shown or not.
 * @param onHide The callback to hide the modal again
 * @param title The title in the header of the modal
 * @param onConfirm The callback for the delete button.
 * @param deletionButtonI18nKey The i18n key for the deletion button.
 * @param titleIcon An optional title icon
 * @param children The children to render into the modal.
 * @param props Additional props directly given to the modal
 */
export const DeletionModal: React.FC<PropsWithChildren<DeletionModalProps>> = ({
  show,
  onHide,
  titleI18nKey,
  onConfirm,
  deletionButtonI18nKey,
  titleIcon,
  children,
  disabled = false,
  footerContent,
  ...props
}) => {
  useTranslation()
  return (
    <CommonModal
      show={show}
      onHide={onHide}
      titleI18nKey={titleI18nKey}
      titleIcon={titleIcon}
      showCloseButton={true}
      {...props}>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        {footerContent}
        <Button {...cypressId('deletionModal.confirmButton')} variant='danger' onClick={onConfirm} disabled={disabled}>
          <Trans i18nKey={deletionButtonI18nKey} />
        </Button>
      </Modal.Footer>
    </CommonModal>
  )
}
