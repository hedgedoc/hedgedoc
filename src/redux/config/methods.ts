import { Config } from '../../api/config/types'
import { store } from '../../utils/store'
import { ConfigActionType, SetConfigAction } from './types'

export const setConfig = (state: Config): void => {
  const action: SetConfigAction = {
    type: ConfigActionType.SET_CONFIG,
    state: state
  }
  store.dispatch(action)
}
