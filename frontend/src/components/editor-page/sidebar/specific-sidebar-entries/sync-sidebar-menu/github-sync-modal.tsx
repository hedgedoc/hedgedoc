/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import type { ModalVisibilityProps } from '../../../../common/modals/common-modal'
import { CommonModal } from '../../../../common/modals/common-modal'
import { Github } from 'react-bootstrap-icons'
import { Modal } from 'react-bootstrap'

/**
 * Placeholder modal for configuring GitHub sync.
 *
 * @param show true to show the modal, false otherwise.
 * @param onHide Callback that is fired when the modal is about to be closed.
 */
export const GithubSyncModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  return (
    <CommonModal show={show} onHide={onHide} showCloseButton={true} titleIcon={Github} title={'Github'}>
      <Modal.Body>{/* Placeholder content for future GitHub sync settings */}</Modal.Body>
    </CommonModal>
  )
}


