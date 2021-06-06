/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import i18n from 'i18next'
import { store } from '../index'
import {
  DismissUiNotificationAction,
  DispatchUiNotificationAction,
  UiNotificationActionType,
  UiNotificationButton
} from './types'
import { DateTime } from 'luxon'
import { IconName } from '../../components/common/fork-awesome/types'

export const DEFAULT_DURATION_IN_SECONDS = 10

export const dispatchUiNotification = (
  title: string,
  content: string,
  durationInSecond = DEFAULT_DURATION_IN_SECONDS,
  icon?: IconName,
  buttons?: UiNotificationButton[]
): void => {
  store.dispatch({
    type: UiNotificationActionType.DISPATCH_NOTIFICATION,
    notification: {
      title,
      content,
      date: DateTime.now(),
      dismissed: false,
      icon,
      durationInSecond,
      buttons: buttons
    }
  } as DispatchUiNotificationAction)
}

export const dismissUiNotification = (notificationId: number): void => {
  store.dispatch({
    type: UiNotificationActionType.DISMISS_NOTIFICATION,
    notificationId
  } as DismissUiNotificationAction)
}

export const showErrorNotification =
  (message: string) =>
  (error: Error): void => {
    console.error(message, error)
    dispatchUiNotification(i18n.t('common.errorOccurred'), message, DEFAULT_DURATION_IN_SECONDS, 'exclamation-triangle')
  }
