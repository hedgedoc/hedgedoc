import { Action } from 'redux'
import { FrontendConfig } from '../../api/frontend-config/types'

export enum FrontendConfigActionType {
  SET_FRONTEND_CONFIG = 'frontend-config/set'
}

export interface FrontendConfigActions extends Action<FrontendConfigActionType> {
  type: FrontendConfigActionType;
}

export interface SetFrontendConfigAction extends FrontendConfigActions {
  state: FrontendConfig;
}
