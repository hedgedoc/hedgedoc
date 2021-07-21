/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import { Config } from '../../api/config/types'
import { ConfigActions, ConfigActionType } from './types'

export const initialState: Config = {
  allowAnonymous: true,
  allowRegister: true,
  authProviders: {
    facebook: false,
    github: false,
    twitter: false,
    gitlab: false,
    dropbox: false,
    ldap: false,
    google: false,
    saml: false,
    oauth2: false,
    internal: false,
    openid: false
  },
  branding: {
    name: '',
    logo: ''
  },
  customAuthNames: {
    ldap: '',
    oauth2: '',
    saml: ''
  },
  maxDocumentLength: 0,
  useImageProxy: false,
  plantumlServer: null,
  specialUrls: {
    privacy: '',
    termsOfUse: '',
    imprint: ''
  },
  version: {
    major: -1,
    minor: -1,
    patch: -1
  },
  iframeCommunication: {
    editorOrigin: '',
    rendererOrigin: ''
  }
}

export const ConfigReducer: Reducer<Config, ConfigActions> = (state: Config = initialState, action: ConfigActions) => {
  switch (action.type) {
    case ConfigActionType.SET_CONFIG:
      return action.state
    default:
      return state
  }
}
