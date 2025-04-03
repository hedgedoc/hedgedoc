/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { fetchDarkModeFromLocalStorage } from '../../components/application-loader/initializers/load-dark-mode'
import { DarkModePreference } from '../../redux/dark-mode/types'
import { useApplicationState } from '../common/use-application-state'
import useMediaQuery from '@restart/hooks/useMediaQuery'
import { useMemo } from 'react'

/**
 * Uses the user settings and the browser preference to determine if dark mode should be used.
 *
 * @return The current state of the dark mode.
 */
export const useDarkModeState = (): boolean => {
  const preference = useApplicationState((state) => state.darkMode.darkModePreference)
  const printModeEnabled = useApplicationState((state) => state.printMode)
  const isBrowserPreferringDark = useMediaQuery('(prefers-color-scheme: dark)')

  return useMemo(() => {
    if (printModeEnabled) {
      return false
    }

    return preference === DarkModePreference.DARK || (preference === DarkModePreference.AUTO && isBrowserPreferringDark)
  }, [preference, printModeEnabled, isBrowserPreferringDark])
}

/**
 * Uses the user settings and the browser preference to determine if dark mode should be used. Value does not change
 *
 * @return The state of the dark mode at time of call.
 */
export const darkModeStateSync = (): boolean => {
  const preference = fetchDarkModeFromLocalStorage()
  const isBrowserPreferringDark = matchMedia('(prefers-color-scheme: dark)').matches

  return preference === DarkModePreference.DARK || (preference === DarkModePreference.AUTO && isBrowserPreferringDark)
}
