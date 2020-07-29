import { combineReducers, Reducer } from 'redux'
import { Config } from '../api/config/types'
import { ApiUrlReducer } from './api-url/reducers'
import { ApiUrlObject } from './api-url/types'
import { BannerReducer } from './banner/reducers'
import { BannerState } from './banner/types'
import { ConfigReducer } from './config/reducers'
import { EditorConfigReducer } from './editor/reducers'
import { EditorConfig } from './editor/types'
import { UserReducer } from './user/reducers'
import { MaybeUserState } from './user/types'

export interface ApplicationState {
  user: MaybeUserState;
  config: Config;
  banner: BannerState;
  apiUrl: ApiUrlObject;
  editorConfig: EditorConfig;
}

export const allReducers: Reducer<ApplicationState> = combineReducers<ApplicationState>({
  user: UserReducer,
  config: ConfigReducer,
  banner: BannerReducer,
  apiUrl: ApiUrlReducer,
  editorConfig: EditorConfigReducer
})
