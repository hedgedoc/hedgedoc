/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import type { DarkModeConfig, SetDarkModeConfigAction } from './types'
import { DarkModeConfigActionType } from './types'
import { Logger } from '../../utils/logger'

const log = new Logger('Redux > DarkMode')

export const setDarkMode = (darkMode: boolean): void => {
  store.dispatch({
    type: DarkModeConfigActionType.SET_DARK_MODE,
    darkMode: darkMode
  } as SetDarkModeConfigAction)
}

export const saveToLocalStorage = (darkModeConfig: DarkModeConfig): void => {
  if (!window) {
    return
  }
  try {
    window.localStorage.setItem('nightMode', String(darkModeConfig.darkMode))
  } catch (error) {
    log.error('Saving to local storage failed', error)
  }
}
