/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Action } from 'redux'

export enum RealtimeActionType {
  ADD_ONLINE_USER = 'realtime/add-user',
  REMOVE_ONLINE_USER = 'realtime/remove-user',
  UPDATE_ONLINE_USER = 'realtime/update-user'
}

export interface RealtimeState {
  users: Record<number, OnlineUser>
}

export enum ActiveIndicatorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface OnlineUser {
  username: string
  color: string
  active: ActiveIndicatorStatus
}

export interface AddOnlineUserAction extends Action<RealtimeActionType> {
  type: RealtimeActionType.ADD_ONLINE_USER
  clientId: number
  user: OnlineUser
}

export interface RemoveOnlineUserAction extends Action<RealtimeActionType> {
  type: RealtimeActionType.REMOVE_ONLINE_USER
  clientId: number
}

export type RealtimeActions = AddOnlineUserAction | RemoveOnlineUserAction
