/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createNote } from '../../../api/notes'
import { moveNoteToFolder } from '../../../api/folders'
import { cypressId } from '../../../utils/cypress-attribute'
import { useUiNotifications } from '../../notifications/ui-notification-boundary'
import { IconButton } from '../icon-button/icon-button'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'
import { FileEarmarkPlus as IconPlus } from 'react-bootstrap-icons'
import { Trans } from 'react-i18next'
import { useFrontendConfig } from '../frontend-config-context/use-frontend-config'
import { PermissionLevel } from '@hedgedoc/commons'
import { useIsLoggedIn } from '../../../hooks/common/use-is-logged-in'

/**
 * Links to the "new note" endpoint
 */
export const NewNoteButton: React.FC = () => {
  const { showErrorNotificationBuilder } = useUiNotifications()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const guestAccessLevel = useFrontendConfig().guestAccess
  const isLoggedIn = useIsLoggedIn()

  const createNewNoteAndRedirect = useCallback((): void => {
    createNote('')
      .then(async (note) => {
        const selectedFolder = searchParams?.get('folder')
        const isMyNotesPage = pathname === '/explore/my'
        const parsedFolderId =
          selectedFolder === null ? null : Number.parseInt(selectedFolder, 10)
        const isValidFolderId = parsedFolderId !== null && !Number.isNaN(parsedFolderId)

        if (isMyNotesPage && isValidFolderId) {
          await moveNoteToFolder(note.metadata.primaryAlias, parsedFolderId)
        }
        router?.push(`/n/${note.metadata.primaryAlias}`)
      })
      .catch((error: Error) => {
        showErrorNotificationBuilder(error.message)
      })
  }, [pathname, router, searchParams, showErrorNotificationBuilder])

  if (!isLoggedIn && guestAccessLevel !== PermissionLevel.FULL) {
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
