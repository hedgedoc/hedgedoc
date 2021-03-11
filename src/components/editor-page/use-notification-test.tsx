/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'
import { DEFAULT_DURATION_IN_SECONDS, dispatchUiNotification } from '../../redux/ui-notifications/methods'

const localStorageKey = 'dontshowtestnotification'

export const useNotificationTest = (): void => {
  useEffect(() => {
    if (window.localStorage.getItem(localStorageKey)) {
      return
    }
    console.debug('[Notifications] Dispatched test notification')
    dispatchUiNotification('Notification-Test!', 'It Works!', DEFAULT_DURATION_IN_SECONDS, 'info-circle', [{
      label: 'Don\'t show again', onClick: () => {
        window.localStorage.setItem(localStorageKey, '1')
      }
    }])
  }, [])
}
