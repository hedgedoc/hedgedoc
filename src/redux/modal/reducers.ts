import { Reducer } from 'redux'
import { ModalShowActions, ModalShowState, SET_HISTORY_DELETE_MODAL_SHOW_ACTION_TYPE } from './types'

export const initialState: ModalShowState = {
  historyDelete: false
}

export const ModalShowReducer: Reducer<ModalShowState, ModalShowActions> = (state: ModalShowState = initialState, action: ModalShowActions) => {
  switch (action.type) {
    case SET_HISTORY_DELETE_MODAL_SHOW_ACTION_TYPE:
      return {
        ...state,
        historyDelete: action.payload
      }
    default:
      return state
  }
}
