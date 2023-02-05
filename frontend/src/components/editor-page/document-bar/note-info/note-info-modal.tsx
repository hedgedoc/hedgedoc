/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cypressId } from '../../../../utils/cypress-attribute'
import type { ModalVisibilityProps } from '../../../common/modals/common-modal'
import { CommonModal } from '../../../common/modals/common-modal'
import { NoteInfoLineContributors } from './note-info-line-contributors'
import { NoteInfoLineCreated } from './note-info-line-created'
import { NoteInfoLineUpdated } from './note-info-line-updated'
import { NoteInfoLineWordCount } from './note-info-line-word-count'
import React from 'react'
import { ListGroup, Modal } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

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
      titleI18nKey={'editor.modal.documentInfo.title'}
      {...cypressId('document-info-modal')}>
      <Modal.Body>
        <ListGroup>
          <ListGroup.Item>
            <NoteInfoLineCreated size={2} />
          </ListGroup.Item>
          <ListGroup.Item>
            <NoteInfoLineUpdated size={2} />
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
