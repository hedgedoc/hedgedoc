import { Reducer } from 'redux'
import { BackendConfig } from '../../api/backend-config/types'
import { BackendConfigActions, BackendConfigActionType, SetBackendConfigAction } from './types'

export const initialState: BackendConfig = {
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
  branding: {
    name: '',
    logo: ''
  },
  banner: {
    text: '',
    timestamp: ''
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
  },
  version: {
    version: '',
    sourceCodeUrl: '',
    issueTrackerUrl: ''
  }
}

export const BackendConfigReducer: Reducer<(BackendConfig), BackendConfigActions> = (state: (BackendConfig) = initialState, action: BackendConfigActions) => {
  switch (action.type) {
    case BackendConfigActionType.SET_BACKEND_CONFIG:
      return (action as SetBackendConfigAction).state
    default:
      return state
  }
}
