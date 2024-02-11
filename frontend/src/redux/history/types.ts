/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntry, HistoryEntryWithOrigin } from '../../api/history/types'

export type HistoryState = HistoryEntryWithOrigin[]

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

export interface UpdateEntryPayload {
  noteId: string
  newEntry: HistoryEntry
}

export interface RemoveEntryPayload {
  noteId: string
}
