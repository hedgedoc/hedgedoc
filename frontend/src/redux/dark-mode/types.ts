/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'

export enum DarkModeConfigActionType {
  SET_DARK_MODE = 'dark-mode/set'
}

export enum DarkModePreference {
  DARK,
  LIGHT,
  AUTO
}

export interface DarkModeConfig {
  darkModePreference: DarkModePreference
}

export type DarkModeConfigAction = Action<DarkModeConfigActionType.SET_DARK_MODE> & DarkModeConfig
