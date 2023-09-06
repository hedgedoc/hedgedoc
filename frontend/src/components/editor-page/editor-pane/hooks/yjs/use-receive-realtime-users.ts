/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../../hooks/common/use-application-state'
import { resetRealtimeStatus, setRealtimeUsers } from '../../../../../redux/realtime/methods'
import type { MessageTransporter } from '@hedgedoc/commons'
import { MessageType } from '@hedgedoc/commons'
import type { Listener } from 'eventemitter2'
import { useEffect } from 'react'

/**
 * Waits for remote cursor updates that are sent from the backend and saves them in the global application state.
 *
 * @param messageTransporter the {@link MessageTransporter} that should be used to receive the remote cursor updates
 */
export const useReceiveRealtimeUsers = (messageTransporter: MessageTransporter): void => {
  const isConnected = useApplicationState((state) => state.realtimeStatus.isConnected)

  useEffect(() => {
    const listener = messageTransporter.on(
      MessageType.REALTIME_USER_STATE_SET,
      (message) =>
        setRealtimeUsers(
          message.payload.users,
          message.payload.ownUser.styleIndex,
          message.payload.ownUser.displayName
        ),
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

  useEffect(() => () => resetRealtimeStatus(), [])
}
