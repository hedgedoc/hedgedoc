import { ActionCreator } from 'redux'
import { SET_HISTORY_DELETE_MODAL_SHOW_ACTION_TYPE, SetHistoryDeleteModalShowAction } from './types'

export const setSignInModalShow: ActionCreator<SetHistoryDeleteModalShowAction> = (historyDelete: boolean) => ({
  type: SET_HISTORY_DELETE_MODAL_SHOW_ACTION_TYPE,
  payload: historyDelete
})
