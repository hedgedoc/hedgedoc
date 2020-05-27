import { Action } from 'redux'

export const SET_HISTORY_DELETE_MODAL_SHOW_ACTION_TYPE = 'modal/history-delete/set'

export interface ModalShowState {
    historyDelete: boolean
}

export interface SetHistoryDeleteModalShowAction extends Action {
    type: string;
    payload: boolean;
}

export type ModalShowActions = SetHistoryDeleteModalShowAction;
