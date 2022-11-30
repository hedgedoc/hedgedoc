/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { DarkModePreference } from '../../redux/dark-mode/types'
import { useApplicationState } from './use-application-state'
import useMediaQuery from '@restart/hooks/useMediaQuery'

/**
 * Uses the user settings and the browser preference to determine if dark mode should be used.
 *
 * @return The current state of the dark mode.
 */
export const useDarkModeState = (): boolean => {
  const preference = useApplicationState((state) => state.darkMode.darkModePreference)
  const isBrowserPreferringDark = useMediaQuery('(prefers-color-scheme: dark)')

  return preference === DarkModePreference.DARK || (preference === DarkModePreference.AUTO && isBrowserPreferringDark)
}
