/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { UiIcon } from '../../common/icons/ui-icon'
import { useSafeRefreshHistoryStateCallback } from './hooks/use-safe-refresh-history-state'
import React from 'react'
import { Button } from 'react-bootstrap'
import { ArrowRepeat as IconArrowRepeat } from 'react-bootstrap-icons'
import { useTranslation } from 'react-i18next'

/**
 * Fetches the current history from the server.
 */
export const HistoryRefreshButton: React.FC = () => {
  const { t } = useTranslation()

  const refreshHistory = useSafeRefreshHistoryStateCallback()

  return (
    <Button variant={'secondary'} title={t('landing.history.toolbar.refresh') ?? undefined} onClick={refreshHistory}>
      <UiIcon icon={IconArrowRepeat} />
    </Button>
  )
}
