import {Action, ActionCreator} from 'redux';
import {ApplicationConfigState} from "./types";

export const SET_APPLICATION_CONFIG_ACTION_TYPE = 'config/set';

export interface SetApplicationConfigAction extends Action {
    type: string;
    payload: {
        state: ApplicationConfigState;
    };
}

export const setApplicationConfig: ActionCreator<SetApplicationConfigAction> = (state: ApplicationConfigState) => ({
    type: SET_APPLICATION_CONFIG_ACTION_TYPE,
    payload: {
        state
    },
})

export type ApplicationConfigActions = SetApplicationConfigAction;
