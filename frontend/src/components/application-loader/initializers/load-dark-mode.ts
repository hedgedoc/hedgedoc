/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DARK_MODE_LOCAL_STORAGE_KEY } from '../../../hooks/dark-mode/use-save-dark-mode-preference-to-local-storage'
import { setDarkModePreference } from '../../../redux/dark-mode/methods'
import { DarkModePreference } from '../../../redux/dark-mode/types'
import { Logger } from '../../../utils/logger'

const logger = new Logger('Dark mode initializer')

/**
 * Loads the saved dark mode setting or tries to derive it from the browser settings.
 * The result is saved in the global application state.
 *
 * @return A promise that resolves as soon as the dark mode has been loaded.
 */
export const loadDarkMode = (): Promise<void> => {
  setDarkModePreference(fetchDarkModeFromLocalStorage())
  return Promise.resolve()
}

/**
 * Tries to read the saved dark mode settings from the browser local storage.
 *
 * @return {@link true} if the local storage has saved that the user prefers dark mode.
 *         {@link false} if the user doesn't prefer dark mode or if the value couldn't be read from local storage.
 */
const fetchDarkModeFromLocalStorage = (): DarkModePreference => {
  try {
    const colorScheme = window.localStorage.getItem(DARK_MODE_LOCAL_STORAGE_KEY)
    if (colorScheme === 'dark') {
      return DarkModePreference.DARK
    } else if (colorScheme === 'light') {
      return DarkModePreference.LIGHT
    } else {
      return DarkModePreference.AUTO
    }
  } catch (error) {
    logger.error('Loading from local storage failed', error)
    return DarkModePreference.AUTO
  }
}
