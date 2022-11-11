/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Reducer } from 'redux'
import type { DarkModeConfig, DarkModeConfigAction } from './types'
import { DarkModeConfigActionType, DarkModePreference } from './types'

const initialState: DarkModeConfig = {
  darkModePreference: DarkModePreference.AUTO
}

export const DarkModeConfigReducer: Reducer<DarkModeConfig, DarkModeConfigAction> = (
  state: DarkModeConfig = initialState,
  action: DarkModeConfigAction
) => {
  switch (action.type) {
    case DarkModeConfigActionType.SET_DARK_MODE:
      return {
        darkModePreference: action.darkModePreference
      }
    default:
      return state
  }
}
