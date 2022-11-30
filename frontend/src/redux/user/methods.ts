/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import type { LoginUserInfo } from '../../api/me/types'
import type { ClearUserAction, SetUserAction } from './types'
import { UserActionType } from './types'

/**
 * Sets the given user state into the redux.
 * @param state The user state to set into the redux.
 */
export const setUser = (state: LoginUserInfo): void => {
  const action: SetUserAction = {
    type: UserActionType.SET_USER,
    state
  }
  store.dispatch(action)
}

/**
 * Clears the user state from the redux.
 */
export const clearUser: () => void = () => {
  const action: ClearUserAction = {
    type: UserActionType.CLEAR_USER
  }
  store.dispatch(action)
}
