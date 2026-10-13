/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DarkModePreference } from '../../redux/dark-mode/types'
import { Logger } from '../../utils/logger'
import { LocalStorageKey } from '../../utils/local-storage-key'
import { useApplicationState } from '../common/use-application-state'
import { useEffect } from 'react'

const logger = new Logger('useSaveDarkModeToLocalStorage')

/**
 * Saves the dark mode preference of the user in the browser's local storage.
 */
export const useSaveDarkModePreferenceToLocalStorage = () => {
  const preference = useApplicationState((state) => state.darkMode.darkModePreference)
  useEffect(() => {
    try {
      if (preference === DarkModePreference.DARK) {
        window.localStorage.setItem(LocalStorageKey.DARK_MODE, 'dark')
      } else if (preference === DarkModePreference.LIGHT) {
        window.localStorage.setItem(LocalStorageKey.DARK_MODE, 'light')
      } else if (preference === DarkModePreference.AUTO) {
        window.localStorage.removeItem(LocalStorageKey.DARK_MODE)
      }
    } catch (error) {
      logger.error('Saving to local storage failed', error)
    }
  }, [preference])
}
