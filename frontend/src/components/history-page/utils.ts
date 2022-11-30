/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { HistoryEntryWithOrigin } from '../../api/history/types'
import type { HistoryToolbarState } from './history-toolbar/history-toolbar-state'
import { SortModeEnum } from './sort-button/sort-button'
import { DateTime } from 'luxon'

/**
 * Parses a given ISO formatted date string and outputs it as a date and time string.
 *
 * @param date The date in ISO format.
 * @return The date formatted as date and time string.
 */
export const formatHistoryDate = (date: string): string => DateTime.fromISO(date).toFormat('DDDD T')

/**
 * Applies sorting and filter rules that match a given toolbar state to a list of history entries.
 *
 * @param entries The history entries to sort and filter.
 * @param toolbarState The state of the history toolbar (sorting rules, keyword and tag input).
 * @return The list of filtered and sorted history entries.
 */
export const sortAndFilterEntries = (
  entries: HistoryEntryWithOrigin[],
  toolbarState: HistoryToolbarState
): HistoryEntryWithOrigin[] => {
  const filteredBySelectedTagsEntries = filterBySelectedTags(entries, toolbarState.selectedTags)
  const filteredByKeywordSearchEntries = filterByKeywordSearch(filteredBySelectedTagsEntries, toolbarState.search)
  return sortEntries(filteredByKeywordSearchEntries, toolbarState)
}

/**
 * Filters the given history entries by the given tags.
 *
 * @param entries The history entries to filter.
 * @param selectedTags The tags that were selected as filter criteria.
 * @return The list of filtered history entries.
 */
const filterBySelectedTags = (entries: HistoryEntryWithOrigin[], selectedTags: string[]): HistoryEntryWithOrigin[] => {
  return entries.filter((entry) => {
    return selectedTags.length === 0 || arrayCommonCheck(entry.tags, selectedTags)
  })
}

/**
 * Checks whether the entries of array 1 are contained in array 2.
 *
 * @param array1 The first input array.
 * @param array2 The second input array.
 * @return true if all entries from array 1 are contained in array 2, false otherwise.
 */
const arrayCommonCheck = <T>(array1: T[], array2: T[]): boolean => {
  const foundElement = array1.find((element1) => array2.find((element2) => element2 === element1))
  return !!foundElement
}

/**
 * Filters the given history entries by the given search term. Works case-insensitive.
 *
 * @param entries The history entries to filter.
 * @param keywords The search term.
 * @return The history entries that contain the search term in their title.
 */
const filterByKeywordSearch = (entries: HistoryEntryWithOrigin[], keywords: string): HistoryEntryWithOrigin[] => {
  const searchTerm = keywords.toLowerCase()
  return entries.filter((entry) => entry.title.toLowerCase().includes(searchTerm))
}

/**
 * Sorts the given history entries by the sorting rules of the provided toolbar state.
 *
 * @param entries The history entries to sort.
 * @param viewState The toolbar state containing the sorting options.
 * @return The sorted history entries.
 */
const sortEntries = (entries: HistoryEntryWithOrigin[], viewState: HistoryToolbarState): HistoryEntryWithOrigin[] => {
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
      if (firstEntry.lastVisitedAt > secondEntry.lastVisitedAt) {
        return 1 * viewState.lastVisitedSortDirection
      }
      if (firstEntry.lastVisitedAt < secondEntry.lastVisitedAt) {
        return -1 * viewState.lastVisitedSortDirection
      }
    }

    return 0
  })
}
