/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { useSafeRefreshHistoryStateCallback } from './hooks/use-safe-refresh-history-state'
import React from 'react'
import { Button } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

/**
 * Fetches the current history from the server.
 */
export const HistoryRefreshButton: React.FC = () => {
  const { t } = useTranslation()

  const refreshHistory = useSafeRefreshHistoryStateCallback()

  return (
    <Button variant={'light'} title={t('landing.history.toolbar.refresh') ?? undefined} onClick={refreshHistory}>
      <ForkAwesomeIcon icon='refresh' />
    </Button>
  )
}
