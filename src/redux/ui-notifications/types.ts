/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action } from 'redux'
import { DateTime } from 'luxon'
import { IconName } from '../../components/common/fork-awesome/types'
import { TOptions } from 'i18next'

export enum UiNotificationActionType {
  DISPATCH_NOTIFICATION = 'notification/dispatch',
  DISMISS_NOTIFICATION = 'notification/dismiss'
}

export interface UiNotificationButton {
  label: string
  onClick: () => void
}

export interface DispatchOptions {
  titleI18nOptions: TOptions | string
  contentI18nOptions: TOptions | string
  durationInSecond: number
  icon?: IconName
  buttons: UiNotificationButton[]
}

export interface UiNotification extends DispatchOptions {
  titleI18nKey: string
  contentI18nKey: string
  date: DateTime
  dismissed: boolean
}

export type UiNotificationActions = DispatchUiNotificationAction | DismissUiNotificationAction

export interface DispatchUiNotificationAction extends Action<UiNotificationActionType> {
  type: UiNotificationActionType.DISPATCH_NOTIFICATION
  notification: UiNotification
  notificationIdCallback: (notificationId: number) => void
}

export interface DismissUiNotificationAction extends Action<UiNotificationActionType> {
  type: UiNotificationActionType.DISMISS_NOTIFICATION
  notificationId: number
}

export type UiNotificationState = UiNotification[]
