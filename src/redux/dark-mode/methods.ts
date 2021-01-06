/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import { DarkModeConfig, DarkModeConfigActionType, SetDarkModeConfigAction } from './types'

export const setDarkMode = (darkMode: boolean): void => {
  const action: SetDarkModeConfigAction = {
    type: DarkModeConfigActionType.SET_DARK_MODE,
    darkMode: darkMode
  }
  store.dispatch(action)
}

export const saveToLocalStorage = (darkModeConfig: DarkModeConfig): void => {
  try {
    window.localStorage.setItem('nightMode', String(darkModeConfig.darkMode))
  } catch (e) {
    console.error('Saving dark-mode setting to local storage failed: ', e)
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
  } catch (e) {
    console.error('Loading dark-mode setting from local storage failed: ', e)
    return undefined
  }
}

export const determineDarkModeBrowserSetting = (): DarkModeConfig | undefined => {
  try {
    const mediaQueryResult = window.matchMedia('(prefers-color-scheme: dark)').matches
    return {
      darkMode: mediaQueryResult
    }
  } catch (e) {
    console.error('Can not determine dark-mode setting from browser: ', e)
    return undefined
  }
}
