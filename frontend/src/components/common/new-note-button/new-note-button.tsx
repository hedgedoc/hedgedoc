/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createNote } from '../../../api/notes'
import { cypressId } from '../../../utils/cypress-attribute'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { IconButton } from '../icon-button/icon-button'
import { useRouter } from 'next/router'
import React, { useCallback } from 'react'
import { FileEarmarkPlus as IconPlus } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'

/**
 * Links to the "new note" endpoint
 */
export const NewNoteButton: React.FC = () => {
  const { showErrorNotification } = useUiNotifications()
  const router = useRouter()
  const createNewNoteAndRedirect = useCallback((): void => {
    createNote('')
      .then((note) => {
        const to = `/n/${note.metadata.primaryAddress}`
        return router?.push(to)
      })
      .catch((error: Error) => {
        showErrorNotification(error.message)
      })
  }, [router, showErrorNotification])

  return (
    <IconButton
      {...cypressId('new-note-button')}
      iconSize={1.5}
      size={'sm'}
      icon={IconPlus}
      onClick={createNewNoteAndRedirect}>
      <Trans i18nKey='navigation.newNote' />
    </IconButton>
  )
}
