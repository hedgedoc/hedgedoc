/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initial-state'
import type { DarkModeConfig } from './types'

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState,
  reducers: {
    setDarkModePreference: (state, action: PayloadAction<DarkModeConfig['darkModePreference']>) => {
      state.darkModePreference = action.payload
    }
  }
})

export const darkModeActionsCreator = darkModeSlice.actions
export const darkModeReducer = darkModeSlice.reducer
