/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react'
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useTranslation } from 'react-i18next'
import { Typeahead } from 'react-bootstrap-typeahead'
import { useHistoryToolbarState } from './toolbar-context/use-history-toolbar-state'
import type { Option } from 'react-bootstrap-typeahead/types/types'

/**
 * Renders an input field that filters history entries by selected tags.
 */
export const TagSelectionInput: React.FC = () => {
  const { t } = useTranslation()
  const [historyToolbarState, setHistoryToolbarState] = useHistoryToolbarState()

  const historyEntries = useApplicationState((state) => state.history)

  const tags = useMemo<string[]>(() => {
    const allTags = historyEntries
      .map((entry) => entry.tags)
      .flat()
      .sort((first, second) => first.toLowerCase().localeCompare(second.toLowerCase()))
    return Array.from(new Set(allTags))
  }, [historyEntries])

  const onChange = useCallback(
    (selectedTags: Option[]) => {
      setHistoryToolbarState((state) => ({
        ...state,
        selectedTags: selectedTags as string[]
      }))
    },
    [setHistoryToolbarState]
  )

  return (
    <Typeahead
      id={'tagsSelection'}
      options={tags}
      multiple={true}
      placeholder={t('landing.history.toolbar.selectTags') ?? undefined}
      onChange={onChange}
      selected={historyToolbarState.selectedTags}
    />
  )
}
