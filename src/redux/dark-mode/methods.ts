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
  try {
    window.localStorage.setItem('nightMode', String(darkModeConfig.darkMode))
  } catch (error) {
    log.error('Saving to local storage failed', error)
  }
}

export const loadFromLocalStorage = (): DarkModeConfig | undefined => {
  try {
    const storedValue = window.localStorage.getItem('nightMode')
    if (!storedValue) {
      return undefined
    }
    return {
      darkMode: storedValue === 'true'
    }
  } catch (error) {
    log.error('Loading from local storage failed', error)
    return undefined
  }
}

export const determineDarkModeBrowserSetting = (): DarkModeConfig | undefined => {
  try {
    const mediaQueryResult = window.matchMedia('(prefers-color-scheme: dark)').matches
    return {
      darkMode: mediaQueryResult
    }
  } catch (error) {
    log.error('Can not determine setting from browser', error)
    return undefined
  }
}
