/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { setRealtimeUsers } from '../../../../../redux/realtime/methods'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useEffect } from 'react'

export const useReceiveRealtimeUsers = (messageTransporter: MessageTransporter) => {
  const isConnected = useApplicationState((state) => state.realtimeStatus.isConnected)

  useEffect(() => {
    const listener = messageTransporter.on(
      MessageType.REALTIME_USER_STATE_SET,
      (payload) => setRealtimeUsers(payload.payload),
      { objectify: true }
    ) as Listener

    return () => {
      listener.off()
    }
  }, [messageTransporter])

  useEffect(() => {
    if (isConnected) {
      messageTransporter.sendMessage({ type: MessageType.REALTIME_USER_STATE_REQUEST })
    }
  }, [isConnected, messageTransporter])
}
