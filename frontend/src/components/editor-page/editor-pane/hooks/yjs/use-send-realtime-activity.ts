/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useIsDocumentVisible } from '../../../../../hooks/common/use-is-document-visible'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import { useEffect } from 'react'
import { useIdle } from 'react-use'

const INACTIVITY_TIMEOUT_SECONDS = 30

/**
 * Sends the activity state (based on the fact if the tab is focused) to the backend.
 *
 * @param messageTransporter The message transporter that handles the connection to the backend
 */
export const useSendRealtimeActivity = (messageTransporter: MessageTransporter) => {
  const active = useIsDocumentVisible()
  const idling = useIdle(INACTIVITY_TIMEOUT_SECONDS * 1000)

  useEffect(() => {
    const listener = messageTransporter.doAsSoonAsReady(() => {
      messageTransporter.sendMessage({
        type: MessageType.REALTIME_USER_SET_ACTIVITY,
        payload: {
          active: active && !idling
        }
      })
    })

    return () => {
      listener.off()
    }
  }, [active, idling, messageTransporter])
}
