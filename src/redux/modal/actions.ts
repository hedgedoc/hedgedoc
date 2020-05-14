import {Action, ActionCreator} from 'redux';

export const SET_HISTORY_DELETE_MODAL_SHOW_ACTION_TYPE = 'modal/history-delete/set';

export interface SetHistoryDeleteModalShowAction extends Action {
    type: string;
    payload:  boolean;
}

export const setSignInModalShow: ActionCreator<SetHistoryDeleteModalShowAction> = (historyDelete: boolean) => ({
    type: SET_HISTORY_DELETE_MODAL_SHOW_ACTION_TYPE,
    payload: historyDelete,
})

export type ModalShowActions = SetHistoryDeleteModalShowAction;
