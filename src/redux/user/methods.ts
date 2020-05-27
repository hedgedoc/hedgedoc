import { CLEAR_USER_ACTION_TYPE, ClearUserAction, SET_USER_ACTION_TYPE, SetUserAction, UserState } from './types'
import { store } from '../../utils/store'

export const setUser: (state: UserState) => void = (state: UserState) => {
  const action: SetUserAction = {
    type: SET_USER_ACTION_TYPE,
    payload: {
      state
    }
  }
  store.dispatch(action)
}

export const clearUser: () => void = () => {
  const action: ClearUserAction = {
    type: CLEAR_USER_ACTION_TYPE,
    payload: null
  }
  store.dispatch(action)
}
