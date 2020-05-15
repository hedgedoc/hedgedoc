import {Action} from "redux";

export const SET_BACKEND_CONFIG_ACTION_TYPE = 'backend-config/set';

export interface BackendConfigState {
    allowAnonymous: boolean,
    authProviders: AuthProvidersState,
    specialLinks: SpecialLinks,
}

export interface AuthProvidersState {
    facebook: true,
    github: false,
    twitter: false,
    gitlab: false,
    dropbox: false,
    ldap: false,
    google: false,
    saml: false,
    oauth2: false,
    email: false,
}

export interface SpecialLinks {
    privacy: string,
    termsOfUse: string,
    imprint: string,
}

export interface SetBackendConfigAction extends Action {
    type: string;
    payload: {
        state: BackendConfigState;
    };
}

export type BackendConfigActions = SetBackendConfigAction;
