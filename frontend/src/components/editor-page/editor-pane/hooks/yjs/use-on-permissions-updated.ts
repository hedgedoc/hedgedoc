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
import { Logger } from '../../../../../utils/logger'
import { DEFAULT_FALLBACK_URL } from '../../../../login-page/utils/use-get-post-login-redirect-url'
import { useRouter } from 'next/navigation'

const logger = new Logger('useOnPermissionsUpdated')

/**
 * Hook that updates the permissions state in the redux if the server announced an update of the note permissions.
 *
 * @param websocketConnection The websocket connection that emits the permissions changed event
 */
export const useOnPermissionsUpdated = (websocketConnection: MessageTransporter): void => {
  const { showErrorNotificationBuilder } = useUiNotifications()
  const router = useRouter()

  useEffect(() => {
    const listener = websocketConnection.on(
      MessageType.PERMISSIONS_UPDATED,
      () => {
        updateNotePermissions().catch(() => {
          logger.error(
            `Got an error while updating note permissions after receiving ${MessageType.PERMISSIONS_UPDATED}. Returning the user to explore page`
          )
          router.replace(DEFAULT_FALLBACK_URL)
        })
      },
      {
        objectify: true
      }
    ) as Listener
    return () => {
      listener.off()
    }
  }, [showErrorNotificationBuilder, websocketConnection, router])
}
