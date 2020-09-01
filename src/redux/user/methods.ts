import { store } from '..'
import { ClearUserAction, SetUserAction, UserActionType, UserState } from './types'

export const setUser: (state: UserState) => void = (state: UserState) => {
  const action: SetUserAction = {
    type: UserActionType.SET_USER,
    state
  }
  store.dispatch(action)
}

export const clearUser: () => void = () => {
  const action: ClearUserAction = {
    type: UserActionType.CLEAR_USER
  }
  store.dispatch(action)
}

export const getUser = (): UserState | null => {
  return store.getState().user
}
