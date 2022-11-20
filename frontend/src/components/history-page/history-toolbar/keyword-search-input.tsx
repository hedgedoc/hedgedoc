/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import { FormControl } from 'react-bootstrap'
import { useOnInputChange } from '../../../hooks/common/use-on-input-change'
import { useHistoryToolbarState } from './toolbar-context/use-history-toolbar-state'

/**
 * A text input that is used to filter history entries for specific keywords.
 */
export const KeywordSearchInput: React.FC = () => {
  const { t } = useTranslation()
  const [historyToolbarState, setHistoryToolbarState] = useHistoryToolbarState()

  const onChange = useOnInputChange((search) => {
    setHistoryToolbarState((state) => ({
      ...state,
      search
    }))
  })

  return (
    <FormControl
      placeholder={t('landing.history.toolbar.searchKeywords') ?? undefined}
      aria-label={t('landing.history.toolbar.searchKeywords') ?? undefined}
      onChange={onChange}
      value={historyToolbarState.search}
    />
  )
}
