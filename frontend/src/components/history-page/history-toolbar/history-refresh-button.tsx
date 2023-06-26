/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTranslatedText } from '../../../hooks/common/use-translated-text'
import { UiIcon } from '../../common/icons/ui-icon'
import { useSafeRefreshHistoryStateCallback } from './hooks/use-safe-refresh-history-state'
import React from 'react'
import { Button } from 'react-bootstrap'
import { ArrowRepeat as IconArrowRepeat } from 'react-bootstrap-icons'

/**
 * Fetches the current history from the server.
 */
export const HistoryRefreshButton: React.FC = () => {
  const refreshHistory = useSafeRefreshHistoryStateCallback()
  const buttonTitle = useTranslatedText('landing.history.toolbar.refresh')

  return (
    <Button variant={'secondary'} title={buttonTitle} onClick={refreshHistory}>
      <UiIcon icon={IconArrowRepeat} />
    </Button>
  )
}
