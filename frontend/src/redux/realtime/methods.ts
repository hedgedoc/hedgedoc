/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import type { SetRealtimeSyncStatusAction, SetRealtimeUsersAction, SetRealtimeConnectionStatusAction } from './types'
import { RealtimeStatusActionType } from './types'
import type { RealtimeUser } from '@hedgedoc/commons'

/**
 * Dispatches an event to add a user
 */
export const setRealtimeUsers = (users: RealtimeUser[]): void => {
  const action: SetRealtimeUsersAction = {
    type: RealtimeStatusActionType.SET_REALTIME_USERS,
    users
  }
  store.dispatch(action)
}

export const setRealtimeConnectionState = (status: boolean): void => {
  store.dispatch({
    type: RealtimeStatusActionType.SET_REALTIME_CONNECTION_STATUS,
    isConnected: status
  } as SetRealtimeConnectionStatusAction)
}

export const setRealtimeSyncedState = (status: boolean): void => {
  store.dispatch({
    type: RealtimeStatusActionType.SET_REALTIME_SYNCED_STATUS,
    isSynced: status
  } as SetRealtimeSyncStatusAction)
}

export const resetRealtimeStatus = (): void => {
  store.dispatch({
    type: RealtimeStatusActionType.RESET_REALTIME_STATUS
  })
}
