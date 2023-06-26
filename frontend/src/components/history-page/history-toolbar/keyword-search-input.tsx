/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { useHistoryToolbarState } from './toolbar-context/use-history-toolbar-state'
import React from 'react'
import { FormControl } from 'react-bootstrap'

/**
 * A text input that is used to filter history entries for specific keywords.
 */
export const KeywordSearchInput: React.FC = () => {
  const [historyToolbarState, setHistoryToolbarState] = useHistoryToolbarState()

  const onChange = useOnInputChange((search) => {
    setHistoryToolbarState((state) => ({
      ...state,
      search
    }))
  })

  const searchKeywordsText = useTranslatedText('landing.history.toolbar.searchKeywords')

  return (
    <FormControl
      placeholder={searchKeywordsText}
      aria-label={searchKeywordsText}
      onChange={onChange}
      value={historyToolbarState.search}
    />
  )
}
