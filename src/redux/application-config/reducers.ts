import {Reducer} from 'redux';
import {ApplicationConfigState} from './types';
import {ApplicationConfigActions, SET_APPLICATION_CONFIG_ACTION_TYPE} from "./actions";

export const initialState: ApplicationConfigState = {
    allowAnonymous: true,
    authProviders: {
        facebook: true,
        github: false,
        twitter: false,
        gitlab: false,
        dropbox: false,
        ldap: false,
        google: false,
        saml: false,
        oauth2: false,
        email: false
    },
    specialLinks: {
        privacy: "",
        termsOfUse: "",
        imprint: "",
    }
};

export const ApplicationConfigReducer: Reducer<ApplicationConfigState, ApplicationConfigActions> = (state: ApplicationConfigState = initialState, action: ApplicationConfigActions) => {
    switch (action.type) {
        case SET_APPLICATION_CONFIG_ACTION_TYPE:
            return action.payload.state;
        default:
            return state;
    }
};
