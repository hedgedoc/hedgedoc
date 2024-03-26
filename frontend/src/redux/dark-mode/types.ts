/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export enum DarkModePreference {
  DARK,
  LIGHT,
  AUTO
}

export interface DarkModeConfig {
  darkModePreference: DarkModePreference
}
