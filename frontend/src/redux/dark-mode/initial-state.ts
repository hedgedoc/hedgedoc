/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { DarkModeConfig } from './types'
import { DarkModePreference } from './types'

export const initialState: DarkModeConfig = {
  darkModePreference: DarkModePreference.AUTO
}
