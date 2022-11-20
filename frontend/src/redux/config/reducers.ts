/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Reducer } from 'redux'
import type { Config } from '../../api/config/types'
import type { ConfigActions } from './types'
import { ConfigActionType } from './types'

export const initialState: Config = {
  allowAnonymous: true,
  allowRegister: true,
  authProviders: [],
  branding: {
    name: '',
    logo: ''
  },
  useImageProxy: false,
  specialUrls: {
    privacy: undefined,
    termsOfUse: undefined,
    imprint: undefined
  },
  version: {
    major: 0,
    minor: 0,
    patch: 0
  },
  plantumlServer: undefined,
  maxDocumentLength: 0
}

export const ConfigReducer: Reducer<Config, ConfigActions> = (state: Config = initialState, action: ConfigActions) => {
  switch (action.type) {
    case ConfigActionType.SET_CONFIG:
      return action.state
    default:
      return state
  }
}
