import { FrontendConfigState, SET_FRONTEND_CONFIG_ACTION_TYPE, SetFrontendConfigAction } from './types'
import { store } from '../../utils/store'

export const setFrontendConfig = (state: FrontendConfigState): void => {
  const action: SetFrontendConfigAction = {
    type: SET_FRONTEND_CONFIG_ACTION_TYPE,
    payload: {
      state
    }
  }
  store.dispatch(action)
}
