/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback } from 'react'
import { Button } from 'react-bootstrap'
import { ForkAwesomeIcon } from '../../common/fork-awesome/fork-awesome-icon'
import { safeRefreshHistoryState } from '../../../redux/history/methods'
import { useTranslation } from 'react-i18next'

/**
 * Fetches the current history from the server.
 */
export const HistoryRefreshButton: React.FC = () => {
  const { t } = useTranslation()

  const refreshHistory = useCallback(() => {
    safeRefreshHistoryState()
  }, [])

  return (
    <Button variant={'light'} title={t('landing.history.toolbar.refresh')} onClick={refreshHistory}>
      <ForkAwesomeIcon icon='refresh' />
    </Button>
  )
}
