/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RealtimeStatus, RealtimeStatusActions } from './types'
import { RealtimeStatusActionType } from './types'
import type { Reducer } from 'redux'

export const initialState: RealtimeStatus = {
  isSynced: false,
  isConnected: false,
  onlineUsers: [],
  ownUser: {
    displayName: '',
    styleIndex: 0
  }
}

/**
 * Applies {@link RealtimeStatusReducer realtime actions} to the global application state.
 *
 * @param state the current state
 * @param action the action that should get applied
 * @return The new changed state
 */
export const RealtimeStatusReducer: Reducer<RealtimeStatus, RealtimeStatusActions> = (
  state = initialState,
  action: RealtimeStatusActions
) => {
  switch (action.type) {
    case RealtimeStatusActionType.SET_REALTIME_USERS:
      return {
        ...state,
        onlineUsers: action.users,
        ownUser: action.ownUser
      }
    case RealtimeStatusActionType.SET_REALTIME_CONNECTION_STATUS:
      return {
        ...state,
        isConnected: action.isConnected
      }
    case RealtimeStatusActionType.SET_REALTIME_SYNCED_STATUS:
      return {
        ...state,
        isSynced: action.isSynced
      }
    case RealtimeStatusActionType.RESET_REALTIME_STATUS:
      return initialState
    default:
      return state
  }
}
