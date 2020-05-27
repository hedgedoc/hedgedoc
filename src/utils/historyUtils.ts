import { HistoryEntry } from '../components/landing/pages/history/history'
import moment from 'moment'
import { HistoryToolbarState } from '../components/landing/pages/history/history-toolbar/history-toolbar'
import { SortModeEnum } from '../components/sort-button/sort-button'

export function sortAndFilterEntries (entries: HistoryEntry[], viewState: HistoryToolbarState): HistoryEntry[] {
  return sortEntries(filterByKeywordSearch(filterBySelectedTags(entries, viewState.selectedTags), viewState.keywordSearch), viewState)
}

function filterBySelectedTags (entries: HistoryEntry[], selectedTags: string[]): HistoryEntry[] {
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

function filterByKeywordSearch (entries: HistoryEntry[], keywords: string): HistoryEntry[] {
  const searchTerm = keywords.toLowerCase()
  return entries.filter(entry => entry.title.toLowerCase().indexOf(searchTerm) !== -1)
}

function sortEntries (entries: HistoryEntry[], viewState: HistoryToolbarState): HistoryEntry[] {
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

export function formatHistoryDate (date: Date): string {
  return moment(date).format('llll')
}

export interface OldHistoryEntry {
    id: string;
    text: string;
    time: number;
    tags: string[];
    pinned: boolean;
}

export function loadHistoryFromLocalStore (): HistoryEntry[] {
  const historyJsonString = window.localStorage.getItem('history')
  if (!historyJsonString) {
    // if localStorage["history"] is empty we check the old localStorage["notehistory"]
    // and convert it to the new format
    const oldHistoryJsonString = window.localStorage.getItem('notehistory')
    const oldHistory = oldHistoryJsonString ? JSON.parse(JSON.parse(oldHistoryJsonString)) as OldHistoryEntry[] : []
    return oldHistory.map((entry: OldHistoryEntry) => {
      return {
        id: entry.id,
        title: entry.text,
        lastVisited: moment(entry.time).toDate(),
        tags: entry.tags,
        pinned: entry.pinned
      }
    })
  } else {
    return JSON.parse(historyJsonString) as HistoryEntry[]
  }
}
