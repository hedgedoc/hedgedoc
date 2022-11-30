/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import type { Config } from '../../api/config/types'
import type { SetConfigAction } from './types'
import { ConfigActionType } from './types'

export const setConfig = (state: Config): void => {
  store.dispatch({
    type: ConfigActionType.SET_CONFIG,
    state: state
  } as SetConfigAction)
}
