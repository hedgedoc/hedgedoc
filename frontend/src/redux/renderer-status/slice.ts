/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { initialState } from './initial-state'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RendererStatus } from './types'

const rendererStatusSlice = createSlice({
  name: 'rendererStatus',
  initialState,
  reducers: {
    setRendererStatus: (state, action: PayloadAction<RendererStatus['rendererReady']>) => {
      state.rendererReady = action.payload
    }
  }
})

export const rendererStatusActionsCreator = rendererStatusSlice.actions
export const rendererStatusReducer = rendererStatusSlice.reducer
