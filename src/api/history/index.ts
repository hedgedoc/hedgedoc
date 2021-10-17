/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'
import type { HistoryEntryDto, HistoryEntryPutDto, HistoryEntryUpdateDto } from './types'

export const getHistory = async (): Promise<HistoryEntryDto[]> => {
  const response = await fetch(getApiUrl() + 'me/history')
  expectResponseCode(response)
  return (await response.json()) as Promise<HistoryEntryDto[]>
}

export const postHistory = async (entries: HistoryEntryPutDto[]): Promise<void> => {
  const response = await fetch(getApiUrl() + 'me/history', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify(entries)
  })
  expectResponseCode(response)
}

export const updateHistoryEntryPinStatus = async (noteId: string, entry: HistoryEntryUpdateDto): Promise<void> => {
  const response = await fetch(getApiUrl() + 'me/history/' + noteId, {
    ...defaultFetchConfig,
    method: 'PUT',
    body: JSON.stringify(entry)
  })
  expectResponseCode(response)
}

export const deleteHistoryEntry = async (noteId: string): Promise<void> => {
  const response = await fetch(getApiUrl() + 'me/history/' + noteId, {
    ...defaultFetchConfig,
    method: 'DELETE'
  })
  expectResponseCode(response)
}

export const deleteHistory = async (): Promise<void> => {
  const response = await fetch(getApiUrl() + 'me/history', {
    ...defaultFetchConfig,
    method: 'DELETE'
  })
  expectResponseCode(response)
}
