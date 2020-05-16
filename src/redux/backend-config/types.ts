import {Action} from "redux";

export const SET_BACKEND_CONFIG_ACTION_TYPE = 'backend-config/set';

export interface BackendConfigState {
    allowAnonymous: boolean,
    authProviders: AuthProvidersState,
    customAuthNames: CustomAuthNames,
    specialLinks: SpecialLinks,
}

export interface AuthProvidersState {
    facebook: boolean,
    github: boolean,
    twitter: boolean,
    gitlab: boolean,
    dropbox: boolean,
    ldap: boolean,
    google: boolean,
    saml: boolean,
    oauth2: boolean,
    email: boolean,
    openid: boolean,
}

export interface CustomAuthNames {
    ldap: string;
    oauth2: string;
    saml: string;
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
