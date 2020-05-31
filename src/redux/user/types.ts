import { Action } from 'redux'

export const SET_USER_ACTION_TYPE = 'user/set'
export const CLEAR_USER_ACTION_TYPE = 'user/clear'

export interface SetUserAction extends Action {
    type: string;
    payload: {
        state: UserState,
    };
}

export interface ClearUserAction extends Action {
    type: string;
    payload: null;
}

export interface UserState {
    status: LoginStatus;
    id: string;
    name: string;
    photo: string;
    provider: LoginProvider;
}

export enum LoginStatus {
    forbidden = 'forbidden',
    ok = 'ok'
}

export enum LoginProvider {
    FACEBOOK = 'facebook',
    GITHUB = 'github',
    TWITTER = 'twitter',
    GITLAB = 'gitlab',
    DROPBOX = 'dropbox',
    GOOGLE = 'google',
    SAML = 'saml',
    OAUTH2 = 'oauth2',
    EMAIL = 'email',
    LDAP = 'ldap',
    OPENID = 'openid'
}

export type UserActions = SetUserAction | ClearUserAction;
