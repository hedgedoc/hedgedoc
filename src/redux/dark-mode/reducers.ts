/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Reducer } from 'redux'
import { saveToLocalStorage } from './methods'
import type { DarkModeConfig, DarkModeConfigActions } from './types'
import { DarkModeConfigActionType } from './types'

const initalState: DarkModeConfig = {
  darkMode: false
}

export const DarkModeConfigReducer: Reducer<DarkModeConfig, DarkModeConfigActions> = (
  state: DarkModeConfig = initalState,
  action: DarkModeConfigActions
) => {
  let darkModeConfigState: DarkModeConfig
  switch (action.type) {
    case DarkModeConfigActionType.SET_DARK_MODE:
      darkModeConfigState = {
        ...state,
        darkMode: action.darkMode
      }
      saveToLocalStorage(darkModeConfigState)
      return darkModeConfigState
    default:
      return state
  }
}
