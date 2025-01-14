/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Fragment } from 'react'
import { Trash as IconTrash } from 'react-bootstrap-icons'
import { Dropdown } from 'react-bootstrap'
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import { UiIcon } from '../../../common/icons/ui-icon'
import { Trans } from 'react-i18next'
import { DeleteNoteModal } from '../../../editor-page/sidebar/specific-sidebar-entries/delete-note-sidebar-entry/delete-note-modal'

export interface DeleteNoteMenuEntryProps {
  onConfirm: (keepMedia: boolean) => void
  noteTitle: string
  isOwner: boolean
}

/**
 * Renders a dropdown item for the {@link EntryMenu history entry menu} that allows to delete the note of the entry.
 *
 * @param noteTitle The title of the note to delete to show it in the deletion confirmation modal
 * @param onConfirm The callback that is fired when the deletion is confirmed
 * @param isOwner Should be true if the user is the owner of the note to enable this feature, otherwise it is disabled
 */
export const DeleteNoteMenuEntry: React.FC<DeleteNoteMenuEntryProps> = ({ noteTitle, onConfirm, isOwner }) => {
  const [isModalVisible, showModal, hideModal] = useBooleanState()
  return (
    <Fragment>
      <Dropdown.Item onClick={showModal} disabled={!isOwner}>
        <UiIcon icon={IconTrash} className='mx-2' />
        <Trans i18nKey={'editor.modal.deleteNote.title'} />
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
