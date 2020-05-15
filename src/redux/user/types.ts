import {Action} from "redux";

export const SET_USER_ACTION_TYPE = 'user/set';
export const CLEAR_USER_ACTION_TYPE = 'user/clear';

export interface SetUserAction extends Action {
    type: string;
    payload: {
        state: UserState,
    };
}

export interface ClearUserAction extends Action {
    type: string;
    payload: {};
}

export interface UserState {
    status: LoginStatus;
    id: string;
    name: string;
    photo: string;
}

export enum LoginStatus {
    forbidden = "forbidden",
    ok = "ok"
}

export type UserActions = SetUserAction | ClearUserAction;
