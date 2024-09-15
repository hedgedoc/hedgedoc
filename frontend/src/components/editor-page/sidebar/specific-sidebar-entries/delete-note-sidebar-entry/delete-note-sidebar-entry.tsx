/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { deleteNote } from '../../../../../api/notes'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { useBooleanState } from '../../../../../hooks/common/use-boolean-state'
import { cypressId } from '../../../../../utils/cypress-attribute'
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import { SidebarButton } from '../../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../../types'
import { DeleteNoteModal } from './delete-note-modal'
import { useRouter } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import React, { Fragment, useCallback } from 'react'
import { Trash as IconTrash } from 'react-bootstrap-icons'
import { Trans, useTranslation } from 'react-i18next'
import { useIsOwner } from '../../../../../hooks/common/use-is-owner'

/**
 * Sidebar entry that can be used to delete the current note.
 *
 * @param hide {@link true} if the entry shouldn't be visible
 * @param className Additional css class names for the sidebar entry
 */
export const DeleteNoteSidebarEntry: React.FC<PropsWithChildren<SpecificSidebarEntryProps>> = ({ hide, className }) => {
  useTranslation()
  const userIsOwner = useIsOwner()
  const router = useRouter()
  const noteId = useApplicationState((state) => state.noteDetails?.id)
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  const { showErrorNotification } = useUiNotifications()

  const deleteNoteAndCloseDialog = useCallback(
    (keepMedia: boolean) => {
      if (noteId === undefined) {
        return
      }
      deleteNote(noteId, keepMedia)
        .then(() => router.push('/history'))
        .catch(showErrorNotification('landing.history.error.deleteNote.text'))
        .finally(closeModal)
    },
    [closeModal, noteId, router, showErrorNotification]
  )

  if (!userIsOwner) {
    return null
  }

  return (
    <Fragment>
      <SidebarButton
        {...cypressId('sidebar.deleteNote.button')}
        icon={IconTrash}
        className={className}
        hide={hide}
        onClick={showModal}>
        <Trans i18nKey={'landing.history.menu.deleteNote'} />
      </SidebarButton>
      <DeleteNoteModal onHide={closeModal} onConfirm={deleteNoteAndCloseDialog} show={modalVisibility} />
    </Fragment>
  )
}
