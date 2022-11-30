/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntryWithOrigin } from '../../api/history/types'
import type { Action } from 'redux'

export interface V1HistoryEntry {
  id: string
  text: string
  time: number
  tags: string[]
  pinned: boolean
}

export interface HistoryExportJson {
  version: number
  entries: HistoryEntryWithOrigin[]
}

export enum HistoryActionType {
  SET_ENTRIES = 'SET_ENTRIES',
  ADD_ENTRY = 'ADD_ENTRY',
  UPDATE_ENTRY = 'UPDATE_ENTRY',
  REMOVE_ENTRY = 'REMOVE_ENTRY'
}

export type HistoryActions = SetEntriesAction | AddEntryAction | UpdateEntryAction | RemoveEntryAction

export interface SetEntriesAction extends Action<HistoryActionType> {
  type: HistoryActionType.SET_ENTRIES
  entries: HistoryEntryWithOrigin[]
}

export interface AddEntryAction extends Action<HistoryActionType> {
  type: HistoryActionType.ADD_ENTRY
  newEntry: HistoryEntryWithOrigin
}

export interface UpdateEntryAction extends Action<HistoryActionType> {
  type: HistoryActionType.UPDATE_ENTRY
  noteId: string
  newEntry: HistoryEntryWithOrigin
}

export interface RemoveEntryAction extends Action<HistoryActionType> {
  type: HistoryActionType.REMOVE_ENTRY
  noteId: string
}
