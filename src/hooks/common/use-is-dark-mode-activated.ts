/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useApplicationState } from './use-application-state'

export const useIsDarkModeActivated = (): boolean => {
  return useApplicationState((state) => state.darkMode.darkMode)
}
