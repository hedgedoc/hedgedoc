/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import type { DarkModeConfigAction, DarkModePreference } from './types'
import { DarkModeConfigActionType } from './types'

export const setDarkModePreference = (darkModePreference: DarkModePreference): void => {
  store.dispatch({
    type: DarkModeConfigActionType.SET_DARK_MODE,
    darkModePreference
  } as DarkModeConfigAction)
}
