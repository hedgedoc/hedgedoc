/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action } from 'redux'
import { Config } from '../../api/config/types'

export enum ConfigActionType {
  SET_CONFIG = 'config/set'
}

export interface ConfigActions extends Action<ConfigActionType> {
  type: ConfigActionType;
}

export interface SetConfigAction extends ConfigActions {
  state: Config;
}
