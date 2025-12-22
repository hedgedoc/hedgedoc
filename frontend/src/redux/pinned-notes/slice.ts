/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initial-state'
import { type NoteExploreEntryInterface } from '@hedgedoc/commons'

const pinnedNotesSlice = createSlice({
  name: 'pinnedNotes',
  initialState,
  reducers: {
    setPinnedNotes: (state, action: PayloadAction<NoteExploreEntryInterface[]>) => {
      for (const entry of action.payload) {
        state[entry.primaryAlias] = entry
      }
    },
    addPinnedNote: (state, action: PayloadAction<NoteExploreEntryInterface>) => {
      if (state[action.payload.primaryAlias] === undefined) {
        state[action.payload.primaryAlias] = action.payload
      }
    },
    removePinnedNote: (state, action: PayloadAction<string>) => {
      if (state[action.payload] !== undefined) {
        delete state[action.payload]
      }
    }
  }
})

export const pinnedNotesActionsCreator = pinnedNotesSlice.actions
export const pinnedNotesReducer = pinnedNotesSlice.reducer
