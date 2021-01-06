/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from 'react-redux'
import { ApplicationState } from '../../redux'

export const useIsDarkModeActivated = (): boolean => {
  return useSelector((state: ApplicationState) => state.darkMode.darkMode)
}
