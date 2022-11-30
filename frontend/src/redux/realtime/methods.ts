/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import type { AddOnlineUserAction, OnlineUser, RemoveOnlineUserAction } from './types'
import { RealtimeActionType } from './types'

/**
 * Dispatches an event to add a user
 *
 * @param clientId The clientId of the user to add
 * @param user The user to add.
 */
export const addOnlineUser = (clientId: number, user: OnlineUser): void => {
  const action: AddOnlineUserAction = {
    type: RealtimeActionType.ADD_ONLINE_USER,
    clientId,
    user
  }
  store.dispatch(action)
}

/**
 * Dispatches an event to remove a user from the online users list.
 *
 * @param clientId The yjs client id of the user to remove from the online users list.
 */
export const removeOnlineUser = (clientId: number): void => {
  const action: RemoveOnlineUserAction = {
    type: RealtimeActionType.REMOVE_ONLINE_USER,
    clientId
  }
  store.dispatch(action)
}
