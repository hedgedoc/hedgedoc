/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useApplicationState } from './use-application-state'

/**
 * Extracts the current state of the dark mode from the global application state.
 *
 * @return The current state of the dark mode.
 */
export const useIsDarkModeActivated = (): boolean => {
  return useApplicationState((state) => state.darkMode.darkMode)
}
