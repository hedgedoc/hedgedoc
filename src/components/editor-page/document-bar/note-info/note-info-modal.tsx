/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { ListGroup, Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import type { ModalVisibilityProps } from '../../../common/modals/common-modal'
import { CommonModal } from '../../../common/modals/common-modal'
import { NoteInfoLineWordCount } from './note-info-line-word-count'
import { cypressId } from '../../../../utils/cypress-attribute'
import { NoteInfoLineCreated } from './note-info-line-created'
import { NoteInfoLineUpdated } from './note-info-line-updated'
import { NoteInfoLineContributors } from './note-info-line-contributors'

/**
 * Modal that shows informational data about the current note.
 *
 * @param show true when the modal should be visible, false otherwise.
 * @param onHide Callback that is fired when the modal is going to be closed.
 */
export const NoteInfoModal: React.FC<ModalVisibilityProps> = ({ show, onHide }) => {
  useTranslation()

  return (
    <CommonModal
      show={show}
      onHide={onHide}
      showCloseButton={true}
      title={'editor.modal.documentInfo.title'}
      {...cypressId('document-info-modal')}>
      <Modal.Body>
        <ListGroup>
          <ListGroup.Item>
            <NoteInfoLineCreated size={'2x'} />
          </ListGroup.Item>
          <ListGroup.Item>
            <NoteInfoLineUpdated size={'2x'} />
          </ListGroup.Item>
          <ListGroup.Item>
            <NoteInfoLineContributors />
          </ListGroup.Item>
          <ListGroup.Item>
            <NoteInfoLineWordCount />
          </ListGroup.Item>
        </ListGroup>
      </Modal.Body>
    </CommonModal>
  )
}
