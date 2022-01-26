/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getGlobalState, store } from '../index'
import type {
  HistoryEntry,
  HistoryExportJson,
  RemoveEntryAction,
  SetEntriesAction,
  UpdateEntryAction,
  V1HistoryEntry
} from './types'
import { HistoryActionType, HistoryEntryOrigin } from './types'
import { download } from '../../components/common/download/download'
import { DateTime } from 'luxon'
import {
  deleteHistory,
  deleteHistoryEntry,
  getHistory,
  postHistory,
  updateHistoryEntryPinStatus
} from '../../api/history'
import {
  historyEntryDtoToHistoryEntry,
  historyEntryToHistoryEntryPutDto,
  historyEntryToHistoryEntryUpdateDto
} from '../../api/history/dto-methods'
import { Logger } from '../../utils/logger'
import { showErrorNotification } from '../ui-notifications/methods'

const log = new Logger('Redux > History')

export const setHistoryEntries = (entries: HistoryEntry[]): void => {
  store.dispatch({
    type: HistoryActionType.SET_ENTRIES,
    entries
  } as SetEntriesAction)
  storeLocalHistory()
}

export const importHistoryEntries = (entries: HistoryEntry[]): Promise<void> => {
  setHistoryEntries(entries)
  return storeRemoteHistory()
}

export const deleteAllHistoryEntries = (): Promise<void> => {
  store.dispatch({
    type: HistoryActionType.SET_ENTRIES,
    entries: []
  } as SetEntriesAction)
  storeLocalHistory()
  return deleteHistory()
}

export const updateHistoryEntryRedux = (noteId: string, newEntry: HistoryEntry): void => {
  store.dispatch({
    type: HistoryActionType.UPDATE_ENTRY,
    noteId,
    newEntry
  } as UpdateEntryAction)
}

export const updateLocalHistoryEntry = (noteId: string, newEntry: HistoryEntry): void => {
  updateHistoryEntryRedux(noteId, newEntry)
  storeLocalHistory()
}

export const removeHistoryEntry = async (noteId: string): Promise<void> => {
  const entryToDelete = getGlobalState().history.find((entry) => entry.identifier === noteId)
  if (entryToDelete && entryToDelete.origin === HistoryEntryOrigin.REMOTE) {
    await deleteHistoryEntry(noteId)
  }
  store.dispatch({
    type: HistoryActionType.REMOVE_ENTRY,
    noteId
  } as RemoveEntryAction)
  storeLocalHistory()
}

export const toggleHistoryEntryPinning = async (noteId: string): Promise<void> => {
  const state = getGlobalState().history
  const entryToUpdate = state.find((entry) => entry.identifier === noteId)
  if (!entryToUpdate) {
    return Promise.reject(`History entry for note '${noteId}' not found`)
  }
  if (entryToUpdate.pinStatus === undefined) {
    entryToUpdate.pinStatus = false
  }
  entryToUpdate.pinStatus = !entryToUpdate.pinStatus
  if (entryToUpdate.origin === HistoryEntryOrigin.LOCAL) {
    updateLocalHistoryEntry(noteId, entryToUpdate)
  } else {
    const historyUpdateDto = historyEntryToHistoryEntryUpdateDto(entryToUpdate)
    await updateHistoryEntryPinStatus(noteId, historyUpdateDto)
    updateHistoryEntryRedux(noteId, entryToUpdate)
  }
}

export const downloadHistory = (): void => {
  const history = getGlobalState().history
  history.forEach((entry: Partial<HistoryEntry>) => {
    delete entry.origin
  })
  const json = JSON.stringify({
    version: 2,
    entries: history
  } as HistoryExportJson)
  download(json, `history_${Date.now()}.json`, 'application/json')
}

export const mergeHistoryEntries = (a: HistoryEntry[], b: HistoryEntry[]): HistoryEntry[] => {
  const noDuplicates = a.filter((entryA) => !b.some((entryB) => entryA.identifier === entryB.identifier))
  return noDuplicates.concat(b)
}

export const convertV1History = (oldHistory: V1HistoryEntry[]): HistoryEntry[] => {
  return oldHistory.map((entry) => ({
    identifier: entry.id,
    title: entry.text,
    tags: entry.tags,
    lastVisited: DateTime.fromMillis(entry.time).toISO(),
    pinStatus: entry.pinned,
    origin: HistoryEntryOrigin.LOCAL
  }))
}

export const refreshHistoryState = async (): Promise<void> => {
  const localEntries = loadLocalHistory()
  if (!getGlobalState().user) {
    setHistoryEntries(localEntries)
    return
  }
  const remoteEntries = await loadRemoteHistory()
  const allEntries = mergeHistoryEntries(localEntries, remoteEntries)
  setHistoryEntries(allEntries)
}

export const safeRefreshHistoryState = (): void => {
  refreshHistoryState().catch(showErrorNotification('landing.history.error.getHistory.text'))
}

export const storeLocalHistory = (): void => {
  const history = getGlobalState().history
  const localEntries = history.filter((entry) => entry.origin === HistoryEntryOrigin.LOCAL)
  const entriesWithoutOrigin = localEntries.map((entry) => ({
    ...entry,
    origin: undefined
  }))
  window.localStorage.setItem('history', JSON.stringify(entriesWithoutOrigin))
}

export const storeRemoteHistory = (): Promise<void> => {
  if (!getGlobalState().user) {
    return Promise.resolve()
  }
  const history = getGlobalState().history
  const remoteEntries = history.filter((entry) => entry.origin === HistoryEntryOrigin.REMOTE)
  const remoteEntryDtos = remoteEntries.map(historyEntryToHistoryEntryPutDto)
  return postHistory(remoteEntryDtos)
}

const loadLocalHistory = (): HistoryEntry[] => {
  const localV1Json = window.localStorage.getItem('notehistory')
  if (localV1Json) {
    try {
      const localV1History = JSON.parse(JSON.parse(localV1Json) as string) as V1HistoryEntry[]
      window.localStorage.removeItem('notehistory')
      return convertV1History(localV1History)
    } catch (error) {
      log.error('Error while converting old history entries', error)
      return []
    }
  }

  const localJson = window.localStorage.getItem('history')
  if (!localJson) {
    return []
  }

  try {
    const localHistory = JSON.parse(localJson) as HistoryEntry[]
    localHistory.forEach((entry) => {
      entry.origin = HistoryEntryOrigin.LOCAL
    })
    return localHistory
  } catch (error) {
    log.error('Error while parsing locally stored history entries', error)
    return []
  }
}

const loadRemoteHistory = async (): Promise<HistoryEntry[]> => {
  try {
    const remoteHistory = await getHistory()
    return remoteHistory.map(historyEntryDtoToHistoryEntry)
  } catch (error) {
    log.error('Error while fetching history entries from server', error)
    return []
  }
}
