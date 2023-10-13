/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsOwner } from '../../../../../../hooks/common/use-is-owner'
import type { ModalVisibilityProps } from '../../../../../common/modals/common-modal'
import { CommonModal } from '../../../../../common/modals/common-modal'
import { PermissionSectionOwner } from './permission-section-owner'
import { PermissionSectionSpecialGroups } from './permission-section-special-groups'
import { PermissionSectionUsers } from './permission-section-users'
import React from 'react'
import { Modal } from 'react-bootstrap'
import { cypressId } from '../../../../../../utils/cypress-attribute'

/**
 * Modal for viewing and managing the permissions of the note.
 *
 * @param show true to show the modal, false otherwise.
 * @param onHide Callback that is fired when the modal is about to be closed.
 */
export const PermissionModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  const isOwner = useIsOwner()
  return (
    <CommonModal
      show={show}
      onHide={onHide}
      showCloseButton={true}
      titleI18nKey={'editor.modal.permissions.title'}
      {...cypressId('permission-modal')}>
      <Modal.Body>
        <PermissionSectionOwner disabled={!isOwner} />
        <PermissionSectionUsers disabled={!isOwner} />
        <PermissionSectionSpecialGroups disabled={!isOwner} />
      </Modal.Body>
    </CommonModal>
  )
}
