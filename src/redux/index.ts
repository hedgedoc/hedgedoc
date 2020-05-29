import { combineReducers, Reducer } from 'redux'
import { UserState } from './user/types'
import { UserReducer } from './user/reducers'
import { BackendConfigState } from './backend-config/types'
import { FrontendConfigState } from './frontend-config/types'
import { BackendConfigReducer } from './backend-config/reducers'
import { FrontendConfigReducer } from './frontend-config/reducers'
import { EditorConfigState } from './editor/types'
import { EditorConfigReducer } from './editor/reducers'

export interface ApplicationState {
    user: UserState;
    backendConfig: BackendConfigState;
    frontendConfig: FrontendConfigState;
    editorConfig: EditorConfigState;
}

export const allReducers: Reducer<ApplicationState> = combineReducers<ApplicationState>({
  user: UserReducer,
  backendConfig: BackendConfigReducer,
  frontendConfig: FrontendConfigReducer,
  editorConfig: EditorConfigReducer
})
