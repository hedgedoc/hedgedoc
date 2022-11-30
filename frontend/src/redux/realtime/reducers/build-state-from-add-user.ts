/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { OnlineUser, RealtimeState } from '../types'

/**
 * Builds a new {@link RealtimeState} with a new client id that is shown as online.
 *
 * @param oldState The old state that will be copied
 * @param clientId The identifier of the new client
 * @param user The information about the new user
 * @return the generated state
 */
export const buildStateFromAddUser = (oldState: RealtimeState, clientId: number, user: OnlineUser): RealtimeState => {
  return {
    users: {
      ...oldState.users,
      [clientId]: user
    }
  }
}
