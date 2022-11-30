/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Config } from '../../api/config/types'
import type { Action } from 'redux'

export enum ConfigActionType {
  SET_CONFIG = 'config/set'
}

export type ConfigActions = SetConfigAction

export interface SetConfigAction extends Action<ConfigActionType> {
  type: ConfigActionType.SET_CONFIG
  state: Config
}
