/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import { Archive as IconArchive } from 'react-bootstrap-icons'
import { useBooleanState } from '../../../hooks/common/use-boolean-state'
import { Dropdown } from 'react-bootstrap'
import { UiIcon } from '../../common/icons/ui-icon'
import { Trans } from 'react-i18next'
import { DeletionModal } from '../../common/modals/deletion-modal'

export interface RemoveNoteEntryItemProps {
  onConfirm: () => void
  noteTitle: string
}

/**
 * Renders a menu item for note deletion with a modal for confirmation.
 *
 * @param noteTitle The title of the note
 * @param onConfirm The callback to delete the note
 */
export const RemoveNoteEntryItem: React.FC<RemoveNoteEntryItemProps> = ({ noteTitle, onConfirm }) => {
  const [isModalVisible, showModal, hideModal] = useBooleanState()
  return (
    <Fragment>
      <Dropdown.Item onClick={showModal}>
        <UiIcon icon={IconArchive} className='mx-2' />
        <Trans i18nKey={'landing.history.menu.removeEntry'} />
      </Dropdown.Item>
      <DeletionModal
        deletionButtonI18nKey={'landing.history.modal.removeNote.button'}
        onConfirm={onConfirm}
        show={isModalVisible}
        onHide={hideModal}
        titleI18nKey={'landing.history.modal.removeNote.title'}>
        <h5>
          <Trans i18nKey={'landing.history.modal.removeNote.question'} />
        </h5>
        <ul>
          <li>{noteTitle}</li>
        </ul>
        <h6>
          <Trans i18nKey={'landing.history.modal.removeNote.warning'} />
        </h6>
      </DeletionModal>
    </Fragment>
  )
}
