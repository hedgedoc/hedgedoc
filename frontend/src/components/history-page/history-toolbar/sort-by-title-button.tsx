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
 * Controls if history entries should be sorted by title.
 */
export const SortByTitleButton: React.FC = () => {
  useTranslation()
  const [historyToolbarState, setHistoryToolbarState] = useHistoryToolbarState()

  const titleSortChanged = useCallback(
    (direction: SortModeEnum) => {
      setHistoryToolbarState((state) => ({
        ...state,
        lastVisitedSortDirection: SortModeEnum.no,
        titleSortDirection: direction
      }))
    },
    [setHistoryToolbarState]
  )

  return (
    <SortButton onDirectionChange={titleSortChanged} direction={historyToolbarState.titleSortDirection}>
      <Trans i18nKey={'landing.history.toolbar.sortByTitle'} />
    </SortButton>
  )
}
