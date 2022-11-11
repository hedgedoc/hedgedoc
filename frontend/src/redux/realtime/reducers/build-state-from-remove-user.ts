/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { RealtimeState } from '../types'

/**
 * Builds a new {@link RealtimeState} but removes the information about a client.
 *
 * @param oldState The old state that will be copied
 * @param clientIdToRemove The identifier of the client that should be removed
 * @return the generated state
 */
export const buildStateFromRemoveUser = (oldState: RealtimeState, clientIdToRemove: number): RealtimeState => {
  const newUsers = { ...oldState.users }
  delete newUsers[clientIdToRemove]
  return {
    users: newUsers
  }
}
