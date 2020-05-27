import { Reducer } from 'redux'
import { BackendConfigActions, BackendConfigState, SET_BACKEND_CONFIG_ACTION_TYPE } from './types'

export const initialState: BackendConfigState = {
  allowAnonymous: true,
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
    email: false,
    openid: false
  },
  customAuthNames: {
    ldap: '',
    oauth2: '',
    saml: ''
  },
  specialLinks: {
    privacy: '',
    termsOfUse: '',
    imprint: ''
  }
}

export const BackendConfigReducer: Reducer<BackendConfigState, BackendConfigActions> = (state: BackendConfigState = initialState, action: BackendConfigActions) => {
  switch (action.type) {
    case SET_BACKEND_CONFIG_ACTION_TYPE:
      return action.payload.state
    default:
      return state
  }
}
