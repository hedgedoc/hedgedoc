/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DateTime } from 'luxon'
import { SortModeEnum } from './sort-button/sort-button'
import type { HistoryToolbarState } from './history-toolbar/history-toolbar'
import type { HistoryEntry } from '../../redux/history/types'

export const formatHistoryDate = (date: string): string => DateTime.fromISO(date).toFormat('DDDD T')

export const sortAndFilterEntries = (entries: HistoryEntry[], toolbarState: HistoryToolbarState): HistoryEntry[] => {
  const filteredBySelectedTagsEntries = filterBySelectedTags(entries, toolbarState.selectedTags)
  const filteredByKeywordSearchEntries = filterByKeywordSearch(
    filteredBySelectedTagsEntries,
    toolbarState.keywordSearch
  )
  return sortEntries(filteredByKeywordSearchEntries, toolbarState)
}

const filterBySelectedTags = (entries: HistoryEntry[], selectedTags: string[]): HistoryEntry[] => {
  return entries.filter((entry) => {
    return selectedTags.length === 0 || arrayCommonCheck(entry.tags, selectedTags)
  })
}

const arrayCommonCheck = <T>(array1: T[], array2: T[]): boolean => {
  const foundElement = array1.find((element1) => array2.find((element2) => element2 === element1))
  return !!foundElement
}

const filterByKeywordSearch = (entries: HistoryEntry[], keywords: string): HistoryEntry[] => {
  const searchTerm = keywords.toLowerCase()
  return entries.filter((entry) => entry.title.toLowerCase().includes(searchTerm))
}

const sortEntries = (entries: HistoryEntry[], viewState: HistoryToolbarState): HistoryEntry[] => {
  return entries.sort((firstEntry, secondEntry) => {
    if (firstEntry.pinStatus && !secondEntry.pinStatus) {
      return -1
    }
    if (!firstEntry.pinStatus && secondEntry.pinStatus) {
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
