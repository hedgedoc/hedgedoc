import { BackendConfig } from '../../api/backend-config/types'
import { store } from '../../utils/store'
import { BackendConfigActionType, SetBackendConfigAction } from './types'

export const setBackendConfig = (state: BackendConfig): void => {
  const action: SetBackendConfigAction = {
    type: BackendConfigActionType.SET_BACKEND_CONFIG,
    state: state
  }
  store.dispatch(action)
}
