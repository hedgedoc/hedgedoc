/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { initialState } from './initial-state'
import type { HistoryState, RemoveEntryPayload, UpdateEntryPayload } from './types'
import type { HistoryEntryWithOrigin } from '../../api/history/types'

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setEntries: (state, action: PayloadAction<HistoryState>) => {
      return action.payload
    },
    updateEntry: (state, action: PayloadAction<UpdateEntryPayload>) => {
      const entryToUpdateIndex = state.findIndex((entry) => entry.identifier === action.payload.noteId)
      if (entryToUpdateIndex < 0) {
        return state
      }
      const updatedEntry: HistoryEntryWithOrigin = { ...state[entryToUpdateIndex], ...action.payload.newEntry }
      return state.toSpliced(entryToUpdateIndex, 1, updatedEntry)
    },
    removeEntry: (state, action: PayloadAction<RemoveEntryPayload>) => {
      return state.filter((entry) => entry.identifier !== action.payload.noteId)
    }
  }
})

export const historyActionsCreator = historySlice.actions
export const historyReducer = historySlice.reducer
