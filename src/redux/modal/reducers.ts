import {Reducer} from 'redux';
import {ModalShowState} from './types';
import {ModalShowActions, SET_HISTORY_DELETE_MODAL_SHOW_ACTION_TYPE} from "./actions";

export const initialState: ModalShowState = {
    historyDelete: false
};

export const ModalShowReducer: Reducer<ModalShowState, ModalShowActions> = (state: ModalShowState = initialState, action: ModalShowActions) => {
    switch (action.type) {
        case SET_HISTORY_DELETE_MODAL_SHOW_ACTION_TYPE:
            return {
                ...state,
                historyDelete: action.payload
            };
        default:
            return state;
    }
};
