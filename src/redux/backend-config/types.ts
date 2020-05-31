import { Action } from 'redux'
import { BackendConfig } from '../../api/backend-config/types'

export enum BackendConfigActionType {
  SET_BACKEND_CONFIG = 'backend-config/set'
}

export interface BackendConfigActions extends Action<BackendConfigActionType>{
  type: BackendConfigActionType;
}

export interface SetBackendConfigAction extends BackendConfigActions {
  state: BackendConfig;
}
