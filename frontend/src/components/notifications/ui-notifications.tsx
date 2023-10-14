/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styles from './notifications.module.scss'
import type { UiNotification } from './types'
import { UiNotificationToast } from './ui-notification-toast'
import React, { useMemo } from 'react'

export interface UiNotificationsProps {
  notifications: Record<string, UiNotification>
}

/**
 * Renders {@link UiNotification notifications} in the top right corner sorted by creation time..
 *
 * @param notifications The notification to render
 */
export const UiNotifications: React.FC<UiNotificationsProps> = ({ notifications }) => {
  const notificationElements = useMemo(() => {
    return Object.values(notifications)
      .sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp)
      .map((notification) => <UiNotificationToast key={notification.uuid} notification={notification} />)
  }, [notifications])

  return (
    <div className={styles['notifications-area']} aria-live='polite' aria-atomic='true'>
      {notificationElements}
    </div>
  )
}
