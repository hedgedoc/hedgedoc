/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntry, HistoryEntryPutDto, HistoryEntryWithOrigin } from './types'
import { HistoryEntryOrigin } from './types'

export const addRemoteOriginToHistoryEntry = (entryDto: HistoryEntry): HistoryEntryWithOrigin => {
  return {
    ...entryDto,
    origin: HistoryEntryOrigin.REMOTE
  }
}

export const historyEntryToHistoryEntryPutDto = (entry: HistoryEntry): HistoryEntryPutDto => {
  return {
    pinStatus: entry.pinStatus,
    lastVisitedAt: entry.lastVisitedAt,
    note: entry.identifier
  }
}
