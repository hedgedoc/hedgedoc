import { HistoryEntry } from '../components/landing/pages/history/history'
import { expectResponseCode, getApiUrl } from '../utils/apiUtils'
import { defaultFetchConfig } from './default'

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
