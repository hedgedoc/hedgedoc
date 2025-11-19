/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initial-state'

const pinnedNotesSlice = createSlice({
  name: 'pinnedNotes',
  initialState,
  reducers: {
    setPinnedNotes: (state, action: PayloadAction<string[]>) => {
      state.pinnedNotes = action.payload
    },
    addPinnedNote: (state, action: PayloadAction<string>) => {
      if (!state.pinnedNotes.includes(action.payload)) {
        state.pinnedNotes.push(action.payload)
      }
    },
    removePinnedNote: (state, action: PayloadAction<string>) => {
      state.pinnedNotes = state.pinnedNotes.filter((alias) => alias !== action.payload)
    }
  }
})

export const pinnedNotesActionsCreator = pinnedNotesSlice.actions
export const pinnedNotesReducer = pinnedNotesSlice.reducer
