/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import { UiNotification, UiNotificationActions, UiNotificationActionType, UiNotificationState } from './types'

export const UiNotificationReducer: Reducer<UiNotificationState, UiNotificationActions> = (
  state: UiNotificationState = [],
  action: UiNotificationActions
) => {
  switch (action.type) {
    case UiNotificationActionType.DISPATCH_NOTIFICATION:
      return addNewNotification(state, action.notification, action.notificationIdCallback)
    case UiNotificationActionType.DISMISS_NOTIFICATION:
      return dismissNotification(state, action.notificationId)
    default:
      return state
  }
}

/**
 * Creates a new {@link UiNotificationState notification state} by appending the given {@link UiNotification}.
 * @param state The current ui notification state
 * @param notification The new notification
 * @param notificationIdCallback This callback is executed with the id of the new notification
 * @return The new {@link UiNotificationState notification state}
 */
const addNewNotification = (
  state: UiNotificationState,
  notification: UiNotification,
  notificationIdCallback: (notificationId: number) => void
): UiNotificationState => {
  const newState = [...state, notification]
  notificationIdCallback(newState.length - 1)
  return newState
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
