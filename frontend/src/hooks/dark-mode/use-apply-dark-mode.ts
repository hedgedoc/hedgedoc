/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DarkModePreference } from '../../redux/dark-mode/types'
import { isClientSideRendering } from '../../utils/is-client-side-rendering'
import { Logger } from '../../utils/logger'
import { useApplicationState } from '../common/use-application-state'
import useMediaQuery from '@restart/hooks/useMediaQuery'
import { useEffect } from 'react'

const logger = new Logger('useApplyDarkMode')

export const DARK_MODE_LOCAL_STORAGE_KEY = 'forcedDarkMode'

/**
 * Applies the `dark` css class to the body tag according to the dark mode state.
 */
export const useApplyDarkMode = (): void => {
  const preference = useApplicationState((state) => state.darkMode.darkModePreference)
  const isBrowserPreferringDark = useMediaQuery('(prefers-color-scheme: dark)')

  useEffect(() => saveToLocalStorage(preference), [preference])
  useEffect(() => {
    if (preference === DarkModePreference.DARK || (preference === DarkModePreference.AUTO && isBrowserPreferringDark)) {
      window.document.body.classList.add('dark')
    } else {
      window.document.body.classList.remove('dark')
    }
  }, [isBrowserPreferringDark, preference])

  useEffect(() => () => window.document.body.classList.remove('dark'), [])
}

export const saveToLocalStorage = (preference: DarkModePreference): void => {
  if (!isClientSideRendering()) {
    return
  }
  try {
    if (preference === DarkModePreference.DARK) {
      window.localStorage.setItem(DARK_MODE_LOCAL_STORAGE_KEY, 'dark')
    } else if (preference === DarkModePreference.LIGHT) {
      window.localStorage.setItem(DARK_MODE_LOCAL_STORAGE_KEY, 'light')
    } else if (preference === DarkModePreference.AUTO) {
      window.localStorage.removeItem(DARK_MODE_LOCAL_STORAGE_KEY)
    }
  } catch (error) {
    logger.error('Saving to local storage failed', error)
  }
}
