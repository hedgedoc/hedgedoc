/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { RealtimeUser } from '@hedgedoc/commons'
import type { Action } from 'redux'

export enum RealtimeStatusActionType {
  SET_REALTIME_USERS = 'realtime/set-users',
  SET_REALTIME_CONNECTION_STATUS = 'realtime/set-connection-status',
  SET_REALTIME_SYNCED_STATUS = 'realtime/set-synced-status',
  RESET_REALTIME_STATUS = 'realtime/reset-realtime-status'
}

export interface SetRealtimeUsersAction extends Action<RealtimeStatusActionType> {
  type: RealtimeStatusActionType.SET_REALTIME_USERS
  users: RealtimeUser[]
}

export interface SetRealtimeConnectionStatusAction extends Action<RealtimeStatusActionType> {
  type: RealtimeStatusActionType.SET_REALTIME_CONNECTION_STATUS
  isConnected: boolean
}

export interface SetRealtimeSyncStatusAction extends Action<RealtimeStatusActionType> {
  type: RealtimeStatusActionType.SET_REALTIME_SYNCED_STATUS
  isSynced: boolean
}

export interface ResetRealtimeStatusAction extends Action<RealtimeStatusActionType> {
  type: RealtimeStatusActionType.RESET_REALTIME_STATUS
}

export interface RealtimeStatus {
  onlineUsers: RealtimeUser[]
  isConnected: boolean
  isSynced: boolean
}

export type RealtimeStatusActions =
  | SetRealtimeUsersAction
  | SetRealtimeConnectionStatusAction
  | SetRealtimeSyncStatusAction
  | ResetRealtimeStatusAction
