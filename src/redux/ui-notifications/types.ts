/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action } from 'redux'
import { DateTime } from 'luxon'
import { IconName } from '../../components/common/fork-awesome/types'

export enum UiNotificationActionType {
  DISPATCH_NOTIFICATION = 'notification/dispatch',
  DISMISS_NOTIFICATION = 'notification/dismiss'
}

export interface UiNotificationButton {
  label: string
  onClick: () => void
}

export interface UiNotification {
  title: string
  date: DateTime
  content: string
  dismissed: boolean
  icon?: IconName
  durationInSecond: number
  buttons?: UiNotificationButton[]
}

export type UiNotificationActions = DispatchUiNotificationAction | DismissUiNotificationAction

export interface DispatchUiNotificationAction extends Action<UiNotificationActionType> {
  type: UiNotificationActionType.DISPATCH_NOTIFICATION
  notification: UiNotification
}

export interface DismissUiNotificationAction extends Action<UiNotificationActionType> {
  type: UiNotificationActionType.DISMISS_NOTIFICATION
  notificationId: number
}

export type UiNotificationState = UiNotification[]
