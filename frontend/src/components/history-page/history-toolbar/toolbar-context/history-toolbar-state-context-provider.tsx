/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useArrayStringUrlParameter } from '../../../../hooks/common/use-array-string-url-parameter'
import { useSingleStringUrlParameter } from '../../../../hooks/common/use-single-string-url-parameter'
import { SortModeEnum } from '../../sort-button/sort-button'
import { ViewStateEnum } from '../history-toolbar'
import type { HistoryToolbarState } from '../history-toolbar-state'
import type { HistoryToolbarStateWithDispatcher } from './toolbar-context'
import type { PropsWithChildren } from 'react'
import React, { createContext, useState } from 'react'

export const historyToolbarStateContext = createContext<HistoryToolbarStateWithDispatcher | undefined>(undefined)

/**
 * Provides a {@link React.Context react context} for the current state of the toolbar.
 *
 * @param children The children that should receive the toolbar state via context.
 */
export const HistoryToolbarStateContextProvider: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  const search = useSingleStringUrlParameter('search', '')
  const selectedTags = useArrayStringUrlParameter('selectedTags')

  const stateWithDispatcher = useState<HistoryToolbarState>(() => ({
    viewState: ViewStateEnum.CARD,
    search: search,
    selectedTags: selectedTags,
    titleSortDirection: SortModeEnum.no,
    lastVisitedSortDirection: SortModeEnum.down
  }))

  return (
    <historyToolbarStateContext.Provider value={stateWithDispatcher}>{children}</historyToolbarStateContext.Provider>
  )
}
