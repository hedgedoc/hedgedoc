import { BackendConfigState, SET_BACKEND_CONFIG_ACTION_TYPE, SetBackendConfigAction } from './types'
import { store } from '../../utils/store'

export const setBackendConfig: (state: BackendConfigState) => void = (state: BackendConfigState) => {
  const action: SetBackendConfigAction = {
    type: SET_BACKEND_CONFIG_ACTION_TYPE,
    payload: {
      state
    }
  }
  store.dispatch(action)
}
