/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import React, { Fragment, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../types'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { cypressId } from '../../../../utils/cypress-attribute'
import { showErrorNotification } from '../../../../redux/ui-notifications/methods'
import { deleteNote } from '../../../../api/notes'
import { DeleteNoteModal } from './delete-note-modal'
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'

/**
 * Sidebar entry that can be used to delete the current note.
 *
 * @param hide {@link true} if the entry shouldn't be visible
 * @param className Additional css class names for the sidebar entry
 */
export const DeleteNoteSidebarEntry: React.FC<PropsWithChildren<SpecificSidebarEntryProps>> = ({ hide, className }) => {
  useTranslation()
  const noteId = useApplicationState((state) => state.noteDetails.id)
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  const deleteNoteAndCloseDialog = useCallback(() => {
    deleteNote(noteId).catch(showErrorNotification('landing.history.error.deleteNote.text')).finally(closeModal)
  }, [closeModal, noteId])

  return (
    <Fragment>
      <SidebarButton
        {...cypressId('sidebar.deleteNote.button')}
        icon={'trash'}
        className={className}
        hide={hide}
        onClick={showModal}>
        <Trans i18nKey={'landing.history.menu.deleteNote'} />
      </SidebarButton>
      <DeleteNoteModal onHide={closeModal} onConfirm={deleteNoteAndCloseDialog} show={modalVisibility} />
    </Fragment>
  )
}
