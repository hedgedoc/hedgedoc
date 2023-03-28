/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../../hooks/common/use-application-state'
import type { MessageTransporter } from '@hedgedoc/commons'
import { useEffect, useRef } from 'react'

/**
 * Disconnects the given {@link MessageTransporter message transporter} if the user status changes through log-in or log-out.
 *
 * @param messageTransporter the message transporter to disconnect
 */
export const useDisconnectOnUserLoginStatusChange = (messageTransporter: MessageTransporter): void => {
  const previousIsLoggedIn = useRef<boolean | undefined>()
  const isLoggedIn = useApplicationState((state) => state.user !== null)
  useEffect(() => {
    if (previousIsLoggedIn.current === undefined) {
      previousIsLoggedIn.current = isLoggedIn
      return
    }
    if (previousIsLoggedIn.current === isLoggedIn) {
      return
    }
    previousIsLoggedIn.current = isLoggedIn
    messageTransporter.disconnect()
  }, [isLoggedIn, messageTransporter])
}
