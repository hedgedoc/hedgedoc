import { Reducer } from 'redux'
import { FrontendConfig } from '../../api/frontend-config/types'
import { FrontendConfigActions, FrontendConfigActionType, SetFrontendConfigAction } from './types'

const initialState: FrontendConfig = {
  backendUrl: ''
}

export const FrontendConfigReducer: Reducer<(FrontendConfig), FrontendConfigActions> = (state: (FrontendConfig) = initialState, action: FrontendConfigActions) => {
  switch (action.type) {
    case FrontendConfigActionType.SET_FRONTEND_CONFIG:
      return (action as SetFrontendConfigAction).state
    default:
      return state
  }
}
