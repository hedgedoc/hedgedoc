/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { SortModeEnum } from '../sort-button/sort-button'
import type { ViewStateEnum } from './history-toolbar'

export type HistoryToolbarState = {
  viewState: ViewStateEnum
  search: string
  selectedTags: string[]
  titleSortDirection: SortModeEnum
  lastVisitedSortDirection: SortModeEnum
}
