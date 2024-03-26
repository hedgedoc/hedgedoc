/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import type { DarkModePreference } from './types'
import { darkModeActionsCreator } from './slice'

export const setDarkModePreference = (darkModePreference: DarkModePreference): void => {
  const action = darkModeActionsCreator.setDarkModePreference(darkModePreference)
  store.dispatch(action)
}
