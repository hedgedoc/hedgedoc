/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initial-state'

const printModeSlice = createSlice({
  name: 'printMode',
  initialState,
  reducers: {
    setPrintMode: (state, action: PayloadAction<boolean>) => {
      state = action.payload
    }
  }
})

export const printModeActionsCreator = printModeSlice.actions
export const printModeReducer = printModeSlice.reducer
