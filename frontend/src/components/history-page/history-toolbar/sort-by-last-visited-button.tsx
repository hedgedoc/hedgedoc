/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SortButton, SortModeEnum } from '../sort-button/sort-button'
import { useHistoryToolbarState } from './toolbar-context/use-history-toolbar-state'
import React, { useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Controls if history entries should be sorted by the last visited date.
 */
export const SortByLastVisitedButton: React.FC = () => {
  useTranslation()
  const [historyToolbarState, setHistoryToolbarState] = useHistoryToolbarState()

  const lastVisitedSortChanged = useCallback(
    (direction: SortModeEnum) => {
      setHistoryToolbarState((state) => ({
        ...state,
        lastVisitedSortDirection: direction,
        titleSortDirection: SortModeEnum.no
      }))
    },
    [setHistoryToolbarState]
  )

  return (
    <SortButton onDirectionChange={lastVisitedSortChanged} direction={historyToolbarState.lastVisitedSortDirection}>
      <Trans i18nKey={'landing.history.toolbar.sortByLastVisited'} />
    </SortButton>
  )
}
