/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'

export enum DarkModeConfigActionType {
  SET_DARK_MODE = 'dark-mode/set'
}

export interface DarkModeConfig {
  darkMode: boolean
}

export type DarkModeConfigActions = SetDarkModeConfigAction

export interface SetDarkModeConfigAction extends Action<DarkModeConfigActionType> {
  type: DarkModeConfigActionType.SET_DARK_MODE
  darkMode: boolean
}
