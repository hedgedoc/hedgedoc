/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react'
import { ListGroup, ListGroupItem, Modal } from 'react-bootstrap'
import type { CommonModalProps } from '../../../common/modals/common-modal'
import { CommonModal } from '../../../common/modals/common-modal'
import { Trans, useTranslation } from 'react-i18next'
import { AliasesList } from './aliases-list'
import { AliasesAddForm } from './aliases-add-form'

/**
 * Component that holds a modal containing a list of aliases associated with the current note.
 *
 * @param show True when the modal should be visible, false otherwise.
 * @param onHide Callback that is executed when the modal is dismissed.
 */
export const AliasesModal: React.FC<CommonModalProps> = ({ show, onHide }) => {
  useTranslation()

  return (
    <CommonModal show={show} onHide={onHide} title={'editor.modal.aliases.title'} showCloseButton={true}>
      <Modal.Body>
        <p>
          <Trans i18nKey={'editor.modal.aliases.explanation'} />
        </p>
        <ListGroup>
          <AliasesList />
          <ListGroupItem>
            <AliasesAddForm />
          </ListGroupItem>
        </ListGroup>
      </Modal.Body>
    </CommonModal>
  )
}
