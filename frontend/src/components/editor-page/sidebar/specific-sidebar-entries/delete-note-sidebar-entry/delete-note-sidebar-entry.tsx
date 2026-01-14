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
 * @param hide true if the entry shouldn't be visible
 * @param className Additional css class names for the sidebar entry
 */
export const DeleteNoteSidebarEntry: React.FC<PropsWithChildren<SpecificSidebarEntryProps>> = ({ hide, className }) => {
  useTranslation()
  const userIsOwner = useIsOwner()
  const router = useRouter()
  const noteAlias = useApplicationState((state) => state.noteDetails?.primaryAlias)
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  const { showErrorNotificationBuilder } = useUiNotifications()

  const deleteNoteAndCloseDialog = useCallback(
    (keepMedia: boolean) => {
      if (noteAlias === undefined) {
        return
      }
      deleteNote(noteAlias, keepMedia)
        .then(() => router.push('/explore/my'))
        .catch(showErrorNotificationBuilder('editor.modal.deleteNote.error'))
        .finally(closeModal)
    },
    [closeModal, noteAlias, router, showErrorNotificationBuilder]
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
        <Trans i18nKey={'editor.modal.deleteNote.title'} />
      </SidebarButton>
      <DeleteNoteModal onHide={closeModal} onConfirm={deleteNoteAndCloseDialog} show={modalVisibility} />
    </Fragment>
  )
}
