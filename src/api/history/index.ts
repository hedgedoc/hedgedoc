/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { HistoryEntry } from '../../components/history-page/history-page'
import { defaultFetchConfig, expectResponseCode, getApiUrl } from '../utils'

export const getHistory = async (): Promise<HistoryEntry[]> => {
  const response = await fetch(getApiUrl() + '/history')
  expectResponseCode(response)
  return await response.json() as Promise<HistoryEntry[]>
}

export const setHistory = async (entries: HistoryEntry[]): Promise<void> => {
  const response = await fetch(getApiUrl() + '/history', {
    ...defaultFetchConfig,
    method: 'POST',
    body: JSON.stringify({
      history: entries
    })
  })
  expectResponseCode(response)
}

export const deleteHistory = async (): Promise<void> => {
  const response = await fetch(getApiUrl() + '/history', {
    ...defaultFetchConfig,
    method: 'DELETE'
  })
  expectResponseCode(response)
}

export const updateHistoryEntry = async (noteId: string, entry: HistoryEntry): Promise<HistoryEntry> => {
  const response = await fetch(getApiUrl() + '/history/' + noteId, {
    ...defaultFetchConfig,
    method: 'PUT',
    body: JSON.stringify(entry)
  })
  expectResponseCode(response)
  return await response.json() as Promise<HistoryEntry>
}

export const deleteHistoryEntry = async (noteId: string): Promise<void> => {
  const response = await fetch(getApiUrl() + '/history/' + noteId, {
    ...defaultFetchConfig,
    method: 'DELETE'
  })
  expectResponseCode(response)
}
