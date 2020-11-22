/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action } from 'redux'

export enum DarkModeConfigActionType {
  SET_DARK_MODE = 'dark-mode/set',
}

export interface DarkModeConfig {
  darkMode: boolean
}

export interface DarkModeConfigActions extends Action<DarkModeConfigActionType> {
  type: DarkModeConfigActionType
}

export interface SetDarkModeConfigAction extends DarkModeConfigActions {
  darkMode: boolean
}
