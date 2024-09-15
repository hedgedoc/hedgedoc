/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import { Trash as IconTrash } from 'react-bootstrap-icons'
import { Dropdown } from 'react-bootstrap'
import { UiIcon } from '../../common/icons/ui-icon'
import { Trans } from 'react-i18next'
import { DeleteNoteModal } from '../../editor-page/sidebar/specific-sidebar-entries/delete-note-sidebar-entry/delete-note-modal'
import { useBooleanState } from '../../../hooks/common/use-boolean-state'

export interface DeleteNoteItemProps {
  onConfirm: (keepMedia: boolean) => void
  noteTitle: string
  isOwner: boolean
}

/**
 * Renders a dropdown item for the {@link EntryMenu history entry menu} that allows to delete the note of the entry.
 *
 * @param noteTitle The title of the note to delete to show it in the deletion confirmation modal
 * @param onConfirm The callback that is fired when the deletion is confirmed
 */
export const DeleteNoteItem: React.FC<DeleteNoteItemProps> = ({ noteTitle, onConfirm, isOwner }) => {
  const [isModalVisible, showModal, hideModal] = useBooleanState()
  return (
    <Fragment>
      <Dropdown.Item onClick={showModal}>
        <UiIcon icon={IconTrash} className='mx-2' />
        <Trans i18nKey={'landing.history.menu.deleteNote'} />
      </Dropdown.Item>
      <DeleteNoteModal
        optionalNoteTitle={noteTitle}
        onConfirm={onConfirm}
        show={isModalVisible}
        onHide={hideModal}
        overrideIsOwner={isOwner}
      />
    </Fragment>
  )
}
