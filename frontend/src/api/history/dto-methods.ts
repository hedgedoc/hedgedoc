/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntry, HistoryEntryPutDto, HistoryEntryWithOrigin } from './types'
import { HistoryEntryOrigin } from './types'

/**
 * Transform a {@link HistoryEntry} into a {@link HistoryEntryWithOrigin}.
 *
 * @param entry the entry to build from
 * @return the history entry with an origin
 */
export const addRemoteOriginToHistoryEntry = (entry: HistoryEntry): HistoryEntryWithOrigin => {
  return {
    ...entry,
    origin: HistoryEntryOrigin.REMOTE
  }
}

/**
 * Create a {@link HistoryEntryPutDto} from a {@link HistoryEntry}.
 *
 * @param entry the entry to build the dto from
 * @return the dto for the api
 */
export const historyEntryToHistoryEntryPutDto = (entry: HistoryEntry): HistoryEntryPutDto => {
  return {
    pinStatus: entry.pinStatus,
    lastVisitedAt: entry.lastVisitedAt,
    note: entry.identifier
  }
}
