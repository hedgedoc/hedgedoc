/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { updateNotePermissions } from '../../../../../redux/note-details/methods'
import { useUiNotifications } from '../../../../notifications/ui-notification-boundary'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useEffect } from 'react'

/**
 * Hook that updates the permissions state in the redux if the server announced an update of the note permissions.
 *
 * @param websocketConnection The websocket connection that emits the permissions changed event
 */
export const useOnPermissionsUpdated = (websocketConnection: MessageTransporter): void => {
  const { showErrorNotificationBuilder } = useUiNotifications()

  useEffect(() => {
    const listener = websocketConnection.on(
      MessageType.PERMISSIONS_UPDATED,
      () => {
        updateNotePermissions().catch(
          showErrorNotificationBuilder('common.errorWhileLoading', { name: 'note permission update' })
        )
      },
      {
        objectify: true
      }
    ) as Listener
    return () => {
      listener.off()
    }
  }, [showErrorNotificationBuilder, websocketConnection])
}
