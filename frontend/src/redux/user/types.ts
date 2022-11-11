/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'
import type { LoginUserInfo } from '../../api/me/types'

export enum UserActionType {
  SET_USER = 'user/set',
  CLEAR_USER = 'user/clear'
}

export type UserActions = SetUserAction | ClearUserAction

export interface SetUserAction extends Action<UserActionType> {
  type: UserActionType.SET_USER
  state: LoginUserInfo
}

export interface ClearUserAction extends Action<UserActionType> {
  type: UserActionType.CLEAR_USER
}

export type OptionalUserState = LoginUserInfo | null
