/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import type { RealtimeUser } from '@hedgedoc/commons'
import { realtimeStatusActionsCreator } from './slice'

/**
 * Dispatches an event to add a user
 */
export const setRealtimeUsers = (users: RealtimeUser[], ownStyleIndex: number, ownDisplayName: string): void => {
  const action = realtimeStatusActionsCreator.setRealtimeUsers({
    users,
    ownUser: {
      styleIndex: ownStyleIndex,
      displayName: ownDisplayName
    }
  })
  store.dispatch(action)
}

export const setRealtimeConnectionState = (status: boolean): void => {
  const action = realtimeStatusActionsCreator.setRealtimeConnectionStatus(status)
  store.dispatch(action)
}

export const setRealtimeSyncedState = (status: boolean): void => {
  const action = realtimeStatusActionsCreator.setRealtimeSyncStatus(status)
  store.dispatch(action)
}

export const resetRealtimeStatus = (): void => {
  const action = realtimeStatusActionsCreator.resetRealtimeStatus()
  store.dispatch(action)
}
