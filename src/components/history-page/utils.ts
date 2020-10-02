import { DateTime } from 'luxon'
import { SortModeEnum } from './sort-button/sort-button'
import {
  HistoryEntry,
  HistoryEntryOrigin,
  HistoryJson,
  LocatedHistoryEntry
} from './history-page'
import { HistoryToolbarState } from './history-toolbar/history-toolbar'

export function collectEntries (localEntries: HistoryEntry[], remoteEntries: HistoryEntry[]): LocatedHistoryEntry[] {
  const locatedLocalEntries = locateEntries(localEntries, HistoryEntryOrigin.LOCAL)
  const locatedRemoteEntries = locateEntries(remoteEntries, HistoryEntryOrigin.REMOTE)
  return mergeEntryArrays(locatedLocalEntries, locatedRemoteEntries)
}

export function sortAndFilterEntries (entries: LocatedHistoryEntry[], toolbarState: HistoryToolbarState): LocatedHistoryEntry[] {
  const filteredBySelectedTagsEntries = filterBySelectedTags(entries, toolbarState.selectedTags)
  const filteredByKeywordSearchEntries = filterByKeywordSearch(filteredBySelectedTagsEntries, toolbarState.keywordSearch)
  return sortEntries(filteredByKeywordSearchEntries, toolbarState)
}

function locateEntries (entries: HistoryEntry[], location: HistoryEntryOrigin): LocatedHistoryEntry[] {
  return entries.map(entry => {
    return {
      ...entry,
      location: location
    }
  })
}

export function mergeEntryArrays<T extends HistoryEntry> (localEntries: T[], remoteEntries: T[]): T[] {
  const filteredLocalEntries = localEntries.filter(localEntry => {
    const entry = remoteEntries.find(remoteEntry => remoteEntry.id === localEntry.id)
    return !entry
  })

  return filteredLocalEntries.concat(remoteEntries)
}

function filterBySelectedTags (entries: LocatedHistoryEntry[], selectedTags: string[]): LocatedHistoryEntry[] {
  return entries.filter(entry => {
    return (selectedTags.length === 0 || arrayCommonCheck(entry.tags, selectedTags))
  }
  )
}

function arrayCommonCheck<T> (array1: T[], array2: T[]): boolean {
  const foundElement = array1.find((element1) =>
    array2.find((element2) =>
      element2 === element1
    )
  )
  return !!foundElement
}

function filterByKeywordSearch (entries: LocatedHistoryEntry[], keywords: string): LocatedHistoryEntry[] {
  const searchTerm = keywords.toLowerCase()
  return entries.filter(entry => entry.title.toLowerCase().includes(searchTerm))
}

function sortEntries (entries: LocatedHistoryEntry[], viewState: HistoryToolbarState): LocatedHistoryEntry[] {
  return entries.sort((firstEntry, secondEntry) => {
    if (firstEntry.pinned && !secondEntry.pinned) {
      return -1
    }
    if (!firstEntry.pinned && secondEntry.pinned) {
      return 1
    }

    if (viewState.titleSortDirection !== SortModeEnum.no) {
      return firstEntry.title.localeCompare(secondEntry.title) * viewState.titleSortDirection
    }

    if (viewState.lastVisitedSortDirection !== SortModeEnum.no) {
      if (firstEntry.lastVisited > secondEntry.lastVisited) {
        return 1 * viewState.lastVisitedSortDirection
      }
      if (firstEntry.lastVisited < secondEntry.lastVisited) {
        return -1 * viewState.lastVisitedSortDirection
      }
    }

    return 0
  })
}

export function formatHistoryDate (date: string): string {
  return DateTime.fromISO(date).toFormat('DDDD T')
}

export interface V1HistoryEntry {
  id: string;
  text: string;
  time: number;
  tags: string[];
  pinned: boolean;
}

export function convertV1History (oldHistory: V1HistoryEntry[]): HistoryEntry[] {
  return oldHistory.map((entry: V1HistoryEntry) => {
    return {
      id: entry.id,
      title: entry.text,
      lastVisited: DateTime.fromMillis(entry.time).toISO(),
      tags: entry.tags,
      pinned: entry.pinned
    }
  })
}

export function loadHistoryFromLocalStore (): HistoryEntry[] {
  const historyJsonString = window.localStorage.getItem('history')

  if (!historyJsonString) {
    // if localStorage["history"] is empty we check the old localStorage["notehistory"]
    // and convert it to the new format
    const oldHistoryJsonString = window.localStorage.getItem('notehistory')
    const oldHistory = oldHistoryJsonString ? JSON.parse(JSON.parse(oldHistoryJsonString)) as V1HistoryEntry[] : []
    return convertV1History(oldHistory)
  } else {
    return JSON.parse(historyJsonString) as HistoryEntry[]
  }
}

export function setHistoryToLocalStore (entries: HistoryEntry[]): void {
  window.localStorage.setItem('history', JSON.stringify(entries))
}

export function downloadHistory (dataObject: HistoryJson): void {
  const data = 'data:text/json;charset=utf-8;base64,' + Buffer.from(JSON.stringify(dataObject)).toString('base64')
  const downloadLink = document.createElement('a')
  downloadLink.setAttribute('href', data)
  downloadLink.setAttribute('download', `history_${(new Date()).getTime()}.json`)
  document.body.appendChild(downloadLink)
  downloadLink.click()
  downloadLink.remove()
}
