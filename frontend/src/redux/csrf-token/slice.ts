/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initial-state'

const csrfTokenSlice = createSlice({
  name: 'csrfToken',
  initialState,
  reducers: {
    setCsrfToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      state.lastUpdatedAt = Date.now()
    },
    clearCsrfToken: (state) => {
      state.token = null
      state.lastUpdatedAt = 0
    }
  }
})

export const csrfTokenActionsCreator = csrfTokenSlice.actions
export const csrfTokenReducer = csrfTokenSlice.reducer
