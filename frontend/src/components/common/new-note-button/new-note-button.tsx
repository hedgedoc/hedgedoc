/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createNote } from '../../../api/notes'
import { cypressId } from '../../../utils/cypress-attribute'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { IconButton } from '../icon-button/icon-button'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import { FileEarmarkPlus as IconPlus } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'
import { useFrontendConfig } from '../frontend-config-context/use-frontend-config'
import { GuestAccess } from '@hedgedoc/commons'
import { useIsLoggedIn } from '../../../hooks/common/use-is-logged-in'

/**
 * Links to the "new note" endpoint
 */
export const NewNoteButton: React.FC = () => {
  const { showErrorNotification } = useUiNotifications()
  const router = useRouter()
  const guestAccessLevel = useFrontendConfig().guestAccess
  const isLoggedIn = useIsLoggedIn()

  const createNewNoteAndRedirect = useCallback((): void => {
    createNote('')
      .then((note) => {
        router?.push(`/n/${note.metadata.primaryAddress}`)
      })
      .catch((error: Error) => {
        showErrorNotification(error.message)
      })
  }, [router, showErrorNotification])

  if (!isLoggedIn && guestAccessLevel !== GuestAccess.CREATE) {
    return null
  }

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
