/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteDetails } from '../../../../../hooks/common/use-note-details'
import { Logger } from '../../../../../utils/logger'
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'

const logger = new Logger('UseOnNoteDeleted')

/**
 * Hook that redirects the user to the history page and displays a notification when the note is deleted.
 *
 * @param websocketConnection The websocket connection that emits the deletion event
 */
export const useOnNoteDeleted = (websocketConnection: MessageTransporter): void => {
  const router = useRouter()
  const noteTitle = useNoteDetails().title
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
    const listener = websocketConnection.on(MessageType.DOCUMENT_DELETED, noteDeletedHandler, {
      objectify: true
    }) as Listener
    return () => {
      listener.off()
    }
  }, [noteDeletedHandler, websocketConnection])
}
