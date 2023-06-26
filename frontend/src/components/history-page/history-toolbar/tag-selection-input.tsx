/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from '../../../hooks/common/use-application-state'
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { useHistoryToolbarState } from './toolbar-context/use-history-toolbar-state'
import React, { useCallback, useMemo } from 'react'
import { Typeahead } from 'react-bootstrap-typeahead'
import type { Option } from 'react-bootstrap-typeahead/types/types'

/**
 * Renders an input field that filters history entries by selected tags.
 */
export const TagSelectionInput: React.FC = () => {
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

  const placeholderText = useTranslatedText('landing.history.toolbar.selectTags')
  return (
    <Typeahead
      id={'tagsSelection'}
      options={tags}
      multiple={true}
      placeholder={placeholderText}
      onChange={onChange}
      selected={historyToolbarState.selectedTags}
    />
  )
}
