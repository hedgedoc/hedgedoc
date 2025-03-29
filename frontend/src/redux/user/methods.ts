/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import { userActionsCreator } from './slice'
import type { LoginUserInfoDto } from '@hedgedoc/commons'

/**
 * Sets the given user state into the redux.
 * @param state The user state to set into the redux.
 */
export const setUser = (state: LoginUserInfoDto): void => {
  const action = userActionsCreator.setUser(state)
  store.dispatch(action)
}

/**
 * Clears the user state from the redux.
 */
export const clearUser = (): void => {
  const action = userActionsCreator.setUser(null)
  store.dispatch(action)
}
