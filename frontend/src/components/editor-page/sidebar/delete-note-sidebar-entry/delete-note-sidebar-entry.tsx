/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { deleteNote } from '../../../../api/notes'
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import { useBooleanState } from '../../../../hooks/common/use-boolean-state'
import { cypressId } from '../../../../utils/cypress-attribute'
import { Logger } from '../../../../utils/logger'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import { SidebarButton } from '../sidebar-button/sidebar-button'
import type { SpecificSidebarEntryProps } from '../types'
import { DeleteNoteModal } from './delete-note-modal'
import { useRouter } from 'next/router'
import type { PropsWithChildren } from 'react'
import React, { Fragment, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'

const logger = new Logger('note-deletion')

/**
 * Sidebar entry that can be used to delete the current note.
 *
 * @param hide {@link true} if the entry shouldn't be visible
 * @param className Additional css class names for the sidebar entry
 */
export const DeleteNoteSidebarEntry: React.FC<PropsWithChildren<SpecificSidebarEntryProps>> = ({ hide, className }) => {
  useTranslation()
  const router = useRouter()
  const noteId = useApplicationState((state) => state.noteDetails.id)
  const [modalVisibility, showModal, closeModal] = useBooleanState()
  const { showErrorNotification } = useUiNotifications()

  const deleteNoteAndCloseDialog = useCallback(() => {
    deleteNote(noteId)
      .then(() => {
        router.push('/history').catch((reason) => logger.error('Error while redirecting to /history', reason))
      })
      .catch(showErrorNotification('landing.history.error.deleteNote.text'))
      .finally(closeModal)
  }, [closeModal, noteId, router, showErrorNotification])

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
