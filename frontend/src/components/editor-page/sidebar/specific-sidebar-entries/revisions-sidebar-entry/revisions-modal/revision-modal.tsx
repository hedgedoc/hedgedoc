/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ModalVisibilityProps } from '../../../../../common/modals/common-modal'
import { CommonModal } from '../../../../../common/modals/common-modal'
import { RevisionModalBody } from './revision-modal-body'
import styles from './revision-modal.module.scss'
import React from 'react'
import { ClockHistory as IconClockHistory } from 'react-bootstrap-icons'

export interface RevisionModalProps {
  onShowDeleteModal: () => void
}

export type RevisionModal = RevisionModalProps & ModalVisibilityProps

/**
 * Modal that shows the available revisions and allows for comparison between them.
 *
 * @param show true to show the modal, false otherwise.
 * @param onHide Callback that is fired when the modal is requested to close.
 * @param onShowDeleteModal Callback to render revision delete modal.
 *
 */
export const RevisionModal: React.FC<RevisionModal> = ({ show, onHide, onShowDeleteModal }) => {
  return (
    <CommonModal
      show={show}
      onHide={onHide}
      titleI18nKey={'editor.modal.revision.title'}
      titleIcon={IconClockHistory}
      showCloseButton={true}
      modalSize={'xl'}
      additionalClasses={styles['revision-modal']}>
      <RevisionModalBody show={show} onShowDeleteModal={onShowDeleteModal} onHide={onHide} />
    </CommonModal>
  )
}
