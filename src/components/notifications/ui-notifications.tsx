/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react'
import { UiNotificationToast } from './ui-notification-toast'
import './notifications.scss'
import { useSelector } from 'react-redux'
import { ApplicationState } from '../../redux'
import equal from 'fast-deep-equal'

export const UiNotifications: React.FC = () => {
  const notifications = useSelector((state: ApplicationState) => state.uiNotifications, equal)

  return (
    <div
      className={ 'notifications-area' }
      aria-live="polite"
      aria-atomic="true">
      {
        notifications.map((notification, notificationIndex) =>
          <UiNotificationToast
            key={ notificationIndex }
            notificationId={ notificationIndex }
            { ...notification }/>)
      }
    </div>
  )
}



