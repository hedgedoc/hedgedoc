/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import {
  HistoryAction,
  HistoryActionType,
  HistoryEntry,
  RemoveEntryAction,
  SetEntriesAction,
  UpdateEntryAction
} from './types'

// Q: Why is the reducer initialized with an empty array instead of the actual history entries like in the config reducer?
// A: The history reducer will be created without entries because of async entry retrieval.
//    Entries will be added after reducer initialization.

export const HistoryReducer: Reducer<HistoryEntry[], HistoryAction> = (
  state: HistoryEntry[] = [],
  action: HistoryAction
) => {
  switch (action.type) {
    case HistoryActionType.SET_ENTRIES:
      return (action as SetEntriesAction).entries
    case HistoryActionType.UPDATE_ENTRY:
      return [
        ...state.filter((entry) => entry.identifier !== (action as UpdateEntryAction).noteId),
        (action as UpdateEntryAction).newEntry
      ]
    case HistoryActionType.REMOVE_ENTRY:
      return state.filter((entry) => entry.identifier !== (action as RemoveEntryAction).noteId)
    default:
      return state
  }
}
