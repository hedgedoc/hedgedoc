/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initial-state'
import type { RealtimeStatus, SetRealtimeUsersPayload } from './types'

const realtimeStatusSlice = createSlice({
  name: 'realtimeStatus',
  initialState,
  reducers: {
    setRealtimeUsers(state, action: PayloadAction<SetRealtimeUsersPayload>) {
      state.onlineUsers = action.payload.users
      state.ownUser = action.payload.ownUser
    },
    setRealtimeConnectionStatus(state, action: PayloadAction<RealtimeStatus['isConnected']>) {
      state.isConnected = action.payload
    },
    setRealtimeSyncStatus(state, action: PayloadAction<RealtimeStatus['isSynced']>) {
      state.isSynced = action.payload
    },
    resetRealtimeStatus() {
      return initialState
    }
  }
})

export const realtimeStatusActionsCreator = realtimeStatusSlice.actions
export const realtimeStatusReducer = realtimeStatusSlice.reducer
