/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useMemo } from 'react'
import { UiNotificationToast } from './ui-notification-toast'
import styles from './notifications.module.scss'
import { useApplicationState } from '../../hooks/common/use-application-state'

/**
 * Renders {@link UiNotification notifications} in the top right corner.
 */
export const UiNotifications: React.FC = () => {
  const notifications = useApplicationState((state) => state.uiNotifications)

  const notificationElements = useMemo(() => {
    return notifications.map((notification, notificationIndex) => (
      <UiNotificationToast key={notificationIndex} notificationId={notificationIndex} {...notification} />
    ))
  }, [notifications])

  return (
    <div className={styles['notifications-area']} aria-live='polite' aria-atomic='true'>
      {notificationElements}
    </div>
  )
}
