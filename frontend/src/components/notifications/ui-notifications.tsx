/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { UiNotificationToast } from './ui-notification-toast'
import styles from './notifications.module.scss'
import type { UiNotification } from './types'

export interface UiNotificationsProps {
  notifications: UiNotification[]
}

/**
 * Renders {@link UiNotification notifications} in the top right corner sorted by creation time..
 *
 * @param notifications The notification to render
 */
export const UiNotifications: React.FC<UiNotificationsProps> = ({ notifications }) => {
  const notificationElements = useMemo(() => {
    return notifications
      .sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp)
      .map((notification) => <UiNotificationToast key={notification.uuid} notification={notification} />)
  }, [notifications])

  return (
    <div className={styles['notifications-area']} aria-live='polite' aria-atomic='true'>
      {notificationElements}
    </div>
  )
}
