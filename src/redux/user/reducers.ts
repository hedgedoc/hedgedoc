/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import { MaybeUserState, SetUserAction, UserActions, UserActionType } from './types'

export const UserReducer: Reducer<MaybeUserState, UserActions> = (state: MaybeUserState = null, action: UserActions) => {
  switch (action.type) {
    case UserActionType.SET_USER:
      return (action as SetUserAction).state
    case UserActionType.CLEAR_USER:
      return null
    default:
      return state
  }
}
