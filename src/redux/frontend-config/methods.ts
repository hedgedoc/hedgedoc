import { FrontendConfig } from '../../api/frontend-config/types'
import { store } from '../../utils/store'
import { FrontendConfigActionType, SetFrontendConfigAction } from './types'

export const setFrontendConfig = (state: FrontendConfig): void => {
  const action: SetFrontendConfigAction = {
    type: FrontendConfigActionType.SET_FRONTEND_CONFIG,
    state: {
      ...state,
      backendUrl: state.backendUrl + '/api/v2.0/'
    }
  }
  store.dispatch(action)
}
