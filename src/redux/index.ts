import { combineReducers, Reducer } from 'redux'
import { BackendConfig } from '../api/backend-config/types'
import { FrontendConfig } from '../api/frontend-config/types'
import { BackendConfigReducer } from './backend-config/reducers'
import { BannerReducer } from './banner/reducers'
import { BannerState } from './banner/types'
import { EditorConfigReducer } from './editor/reducers'
import { EditorConfig } from './editor/types'
import { FrontendConfigReducer } from './frontend-config/reducers'
import { UserReducer } from './user/reducers'
import { MaybeUserState } from './user/types'

export interface ApplicationState {
    user: MaybeUserState;
    backendConfig: BackendConfig;
    banner: BannerState;
    frontendConfig: FrontendConfig;
    editorConfig: EditorConfig;
}

export const allReducers: Reducer<ApplicationState> = combineReducers<ApplicationState>({
  user: UserReducer,
  backendConfig: BackendConfigReducer,
  banner: BannerReducer,
  frontendConfig: FrontendConfigReducer,
  editorConfig: EditorConfigReducer
})
