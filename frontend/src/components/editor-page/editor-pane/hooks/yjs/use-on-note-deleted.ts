/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { YDocMessageTransporter } from '@hedgedoc/realtime'
import { MessageType } from '@hedgedoc/realtime'
import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Logger } from '../../../../../utils/logger'
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'

const logger = new Logger('UseOnNoteDeleted')

/**
 * Hook that redirects the user to the history page and displays a notification when the note is deleted.
 *
 * @param websocketConnection The websocket connection that emits the deletion event
 */
export const useOnNoteDeleted = (websocketConnection: YDocMessageTransporter): void => {
  const router = useRouter()
  const noteTitle = useApplicationState((state) => state.noteDetails.title)
  const { dispatchUiNotification } = useUiNotifications()

  const noteDeletedHandler = useCallback(() => {
    dispatchUiNotification('notifications.noteDeleted.title', 'notifications.noteDeleted.text', {
      titleI18nOptions: {
        noteTitle
      }
    })
    router?.push('/history').catch((error: Error) => {
      logger.error(`Error while redirecting to /history`, error)
    })
  }, [router, noteTitle, dispatchUiNotification])

  useEffect(() => {
    websocketConnection.on(MessageType.DOCUMENT_DELETED, noteDeletedHandler)
    return () => {
      websocketConnection.off(MessageType.DOCUMENT_DELETED, noteDeletedHandler)
    }
  })
}
