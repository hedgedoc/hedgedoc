/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { OptionalUserState, UserActions } from './types'
import { UserActionType } from './types'
import type { Reducer } from 'redux'

export const UserReducer: Reducer<OptionalUserState, UserActions> = (
  state: OptionalUserState = null,
  action: UserActions
) => {
  switch (action.type) {
    case UserActionType.SET_USER:
      return action.state
    case UserActionType.CLEAR_USER:
      return null
    default:
      return state
  }
}
