/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { HistoryEntry } from '../../redux/history/types'
import { HistoryEntryOrigin } from '../../redux/history/types'
import type { HistoryEntryDto, HistoryEntryPutDto, HistoryEntryUpdateDto } from './types'

export const historyEntryDtoToHistoryEntry = (entryDto: HistoryEntryDto): HistoryEntry => {
  return {
    origin: HistoryEntryOrigin.REMOTE,
    title: entryDto.title,
    pinStatus: entryDto.pinStatus,
    identifier: entryDto.identifier,
    tags: entryDto.tags,
    lastVisited: entryDto.lastVisited
  }
}

export const historyEntryToHistoryEntryPutDto = (entry: HistoryEntry): HistoryEntryPutDto => {
  return {
    pinStatus: entry.pinStatus,
    lastVisited: entry.lastVisited,
    note: entry.identifier
  }
}

export const historyEntryToHistoryEntryUpdateDto = (entry: HistoryEntry): HistoryEntryUpdateDto => {
  return {
    pinStatus: entry.pinStatus
  }
}
