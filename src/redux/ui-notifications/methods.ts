/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { TOptions } from 'i18next'
import { t } from 'i18next'
import { store } from '../index'
import type { DismissUiNotificationAction, DispatchOptions, DispatchUiNotificationAction } from './types'
import { UiNotificationActionType } from './types'
import { DateTime } from 'luxon'
import { Logger } from '../../utils/logger'

const log = new Logger('Redux > Notifications')

export const DEFAULT_DURATION_IN_SECONDS = 10

/**
 * Dispatches a new UI Notification into the global application state.
 *
 * @param titleI18nKey I18n key used to show the localized title
 * @param contentI18nKey I18n key used to show the localized content
 * @param icon The icon in the upper left corner
 * @param durationInSecond Show duration of the notification. If omitted then a {@link DEFAULT_DURATION_IN_SECONDS default value} will be used.
 * @param buttons A array of actions that are shown in the notification
 * @param contentI18nOptions Options to configure the translation of the title. (e.g. variables)
 * @param titleI18nOptions Options to configure the translation of the content. (e.g. variables)
 * @return a promise that resolves as soon as the notification id available.
 */
export const dispatchUiNotification = async (
  titleI18nKey: string,
  contentI18nKey: string,
  { icon, durationInSecond, buttons, contentI18nOptions, titleI18nOptions }: Partial<DispatchOptions>
): Promise<number> => {
  return new Promise((resolve) => {
    store.dispatch({
      type: UiNotificationActionType.DISPATCH_NOTIFICATION,
      notificationIdCallback: (notificationId: number) => {
        resolve(notificationId)
      },
      notification: {
        titleI18nKey,
        contentI18nKey,
        date: DateTime.now(),
        dismissed: false,
        titleI18nOptions: titleI18nOptions ?? {},
        contentI18nOptions: contentI18nOptions ?? {},
        durationInSecond: durationInSecond ?? DEFAULT_DURATION_IN_SECONDS,
        buttons: buttons ?? [],
        icon: icon
      }
    } as DispatchUiNotificationAction)
  })
}

/**
 * Dismisses a notification. It won't be removed from the global application state but hidden.
 *
 * @param notificationId The id of the notification to dismissed. Can be obtained from the returned promise of {@link dispatchUiNotification}
 */
export const dismissUiNotification = (notificationId: number): void => {
  store.dispatch({
    type: UiNotificationActionType.DISMISS_NOTIFICATION,
    notificationId
  } as DismissUiNotificationAction)
}

/**
 * Dispatches an notification that is specialized for errors.
 *
 * @param messageI18nKey i18n key for the message
 * @param messageI18nOptions i18n options for the message
 */
export const showErrorNotification =
  (messageI18nKey: string, messageI18nOptions?: TOptions | string) =>
  (error: Error): void => {
    log.error(t(messageI18nKey, messageI18nOptions), error)
    void dispatchUiNotification('common.errorOccurred', messageI18nKey, {
      contentI18nOptions: messageI18nOptions,
      icon: 'exclamation-triangle'
    })
  }
