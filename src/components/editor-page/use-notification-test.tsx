/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'
import { dispatchUiNotification } from '../../redux/ui-notifications/methods'

const localStorageKey = 'dontshowtestnotification'

/**
 * Spawns a notification to test the system. Only for tech demo show case.
 */
export const useNotificationTest = (): void => {
  useEffect(() => {
    if (window.localStorage.getItem(localStorageKey)) {
      return
    }
    console.debug('[Notifications] Dispatched test notification')
    void dispatchUiNotification('notificationTest.title', 'notificationTest.content', {
      icon: 'info-circle',
      buttons: [
        {
          label: "Don't show again",
          onClick: () => {
            window.localStorage.setItem(localStorageKey, '1')
          }
        }
      ]
    })
  }, [])
}
