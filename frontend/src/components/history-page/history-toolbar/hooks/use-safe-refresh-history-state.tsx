/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { refreshHistoryState } from '../../../../redux/history/methods'
import { useUiNotifications } from '../../../notifications/ui-notification-boundary'
import { useCallback } from 'react'

/**
 * Tries to refresh the history from the backend and shows notification if that request fails.
 */
export const useSafeRefreshHistoryStateCallback = () => {
  const { showErrorNotification } = useUiNotifications()
  return useCallback(() => {
    refreshHistoryState().catch(showErrorNotification('landing.history.error.getHistory.text'))
  }, [showErrorNotification])
}
