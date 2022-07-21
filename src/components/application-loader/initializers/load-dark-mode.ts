/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setDarkMode } from '../../../redux/dark-mode/methods'
import { Logger } from '../../../utils/logger'
import type { DarkModeConfig } from '../../../redux/dark-mode/types'
import { isClientSideRendering } from '../../../utils/is-client-side-rendering'

const logger = new Logger('Dark mode initializer')

/**
 * Loads the saved dark mode setting or tries to derive it from the browser settings.
 * The result is saved in the global application state.
 *
 * @return A promise that resolves as soon as the dark mode has been loaded.
 */
export const loadDarkMode = async (): Promise<void> => {
  return new Promise<void>((resolve) => {
    setDarkMode(
      fetchDarkModeFromLocalStorage() ??
        determineDarkModeBrowserSettings() ?? {
          darkMode: false
        }
    )
    resolve()
  })
}

/**
 * Tries to read the saved dark mode settings from the browser local storage.
 *
 * @return {@link true} if the local storage has saved that the user prefers dark mode.
 *         {@link false} if the user doesn't prefer dark mode or if the value couldn't be read from local storage.
 */
const fetchDarkModeFromLocalStorage = (): boolean => {
  if (!isClientSideRendering()) {
    return false
  }
  try {
    return window.localStorage.getItem('nightMode') === 'true'
  } catch (error) {
    logger.error('Loading from local storage failed', error)
    return false
  }
}

/**
 * Tries to read the preferred dark mode setting from the browser settings.
 *
 * @return {@link true} if the browser has reported that the user prefers dark mode.
 *         {@link false} if the browser doesn't prefer dark mode.
 *         {@link undefined} if the browser doesn't support the `prefers-color-scheme` media query.
 */
const determineDarkModeBrowserSettings = (): DarkModeConfig | undefined => {
  if (!isClientSideRendering()) {
    return {
      darkMode: false
    }
  }
  try {
    const mediaQueryResult = window.matchMedia('(prefers-color-scheme: dark)').matches
    return {
      darkMode: mediaQueryResult
    }
  } catch (error) {
    logger.error('Can not determine setting from browser', error)
    return undefined
  }
}
