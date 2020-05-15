import {Action} from "redux";

export const SET_FRONTEND_CONFIG_ACTION_TYPE = 'frontend-config/set';

export interface SetFrontendConfigAction extends Action {
    type: string;
    payload: {
        state: FrontendConfigState;
    };
}

export interface FrontendConfigState {
    backendUrl: string,
}

export type FrontendConfigActions = SetFrontendConfigAction;
