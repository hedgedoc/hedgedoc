import { combineReducers, Reducer } from 'redux'
import { BackendConfig } from '../api/backend-config/types'
import { FrontendConfig } from '../api/frontend-config/types'
import { BackendConfigReducer } from './backend-config/reducers'
import { EditorConfigReducer } from './editor/reducers'
import { EditorConfig } from './editor/types'
import { FrontendConfigReducer } from './frontend-config/reducers'
import { UserReducer } from './user/reducers'
import { MaybeUserState } from './user/types'

export interface ApplicationState {
    user: MaybeUserState;
    backendConfig: BackendConfig;
    frontendConfig: FrontendConfig;
    editorConfig: EditorConfig;
}

export const allReducers: Reducer<ApplicationState> = combineReducers<ApplicationState>({
  user: UserReducer,
  backendConfig: BackendConfigReducer,
  frontendConfig: FrontendConfigReducer,
  editorConfig: EditorConfigReducer
})
