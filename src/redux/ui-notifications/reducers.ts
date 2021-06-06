/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import {
  DismissUiNotificationAction,
  DispatchUiNotificationAction,
  UiNotificationAction,
  UiNotificationActionType,
  UiNotificationState
} from './types'

export const UiNotificationReducer: Reducer<UiNotificationState, UiNotificationAction> = (
  state: UiNotificationState = [],
  action: UiNotificationAction
) => {
  switch (action.type) {
    case UiNotificationActionType.DISPATCH_NOTIFICATION:
      return state.concat((action as DispatchUiNotificationAction).notification)
    case UiNotificationActionType.DISMISS_NOTIFICATION:
      return dismissNotification(state, (action as DismissUiNotificationAction).notificationId)
    default:
      return state
  }
}

const dismissNotification = (
  notificationState: UiNotificationState,
  notificationIndex: number
): UiNotificationState => {
  const newArray = [...notificationState]
  const oldNotification = newArray[notificationIndex]
  newArray[notificationIndex] = {
    ...oldNotification,
    dismissed: true
  }
  return newArray
}
