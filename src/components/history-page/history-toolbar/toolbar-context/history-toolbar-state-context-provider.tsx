/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { PropsWithChildren } from 'react'
import React, { createContext, useState } from 'react'
import type { HistoryToolbarStateWithDispatcher } from './toolbar-context'
import { SortModeEnum } from '../../sort-button/sort-button'
import { ViewStateEnum } from '../history-toolbar'
import { useSingleStringUrlParameter } from '../../../../hooks/common/use-single-string-url-parameter'
import { useArrayStringUrlParameter } from '../../../../hooks/common/use-array-string-url-parameter'
import type { HistoryToolbarState } from '../history-toolbar-state'

export const historyToolbarStateContext = createContext<HistoryToolbarStateWithDispatcher | undefined>(undefined)

/**
 * Provides a {@link React.Context react context} for the current state of the toolbar.
 *
 * @param children The children that should receive the toolbar state via context.
 */
export const HistoryToolbarStateContextProvider: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  const urlParameterSearch = useSingleStringUrlParameter('search', '')
  const urlParameterSelectedTags = useArrayStringUrlParameter('selectedTags')

  const stateWithDispatcher = useState<HistoryToolbarState>(() => ({
    viewState: ViewStateEnum.CARD,
    search: urlParameterSearch,
    selectedTags: urlParameterSelectedTags,
    titleSortDirection: SortModeEnum.no,
    lastVisitedSortDirection: SortModeEnum.down
  }))

  return (
    <historyToolbarStateContext.Provider value={stateWithDispatcher}>{children}</historyToolbarStateContext.Provider>
  )
}
