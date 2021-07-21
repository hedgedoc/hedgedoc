/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import { HistoryActions, HistoryActionType, HistoryEntry } from './types'

// Q: Why is the reducer initialized with an empty array instead of the actual history entries like in the config reducer?
// A: The history reducer will be created without entries because of async entry retrieval.
//    Entries will be added after reducer initialization.

export const HistoryReducer: Reducer<HistoryEntry[], HistoryActions> = (
  state: HistoryEntry[] = [],
  action: HistoryActions
) => {
  switch (action.type) {
    case HistoryActionType.SET_ENTRIES:
      return action.entries
    case HistoryActionType.UPDATE_ENTRY:
      return [...state.filter((entry) => entry.identifier !== action.noteId), action.newEntry]
    case HistoryActionType.REMOVE_ENTRY:
      return state.filter((entry) => entry.identifier !== action.noteId)
    default:
      return state
  }
}
