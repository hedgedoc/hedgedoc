/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { combineReducers, createStore, Reducer } from 'redux'
import { Config } from '../api/config/types'
import { ApiUrlReducer } from './api-url/reducers'
import { ApiUrlObject } from './api-url/types'
import { BannerReducer } from './banner/reducers'
import { BannerState } from './banner/types'
import { ConfigReducer } from './config/reducers'
import { DarkModeConfigReducer } from './dark-mode/reducers'
import { DarkModeConfig } from './dark-mode/types'
import { EditorConfigReducer } from './editor/reducers'
import { EditorConfig } from './editor/types'
import { NoteDetailsReducer } from './note-details/reducers'
import { NoteDetails } from './note-details/types'
import { UserReducer } from './user/reducers'
import { OptionalUserState } from './user/types'
import { UiNotificationState } from './ui-notifications/types'
import { UiNotificationReducer } from './ui-notifications/reducers'
import { HistoryEntry } from './history/types'
import { HistoryReducer } from './history/reducers'
import { RendererStatusReducer } from './renderer-status/reducers'
import { RendererStatus } from './renderer-status/types'

export interface ApplicationState {
  user: OptionalUserState
  config: Config
  banner: BannerState
  history: HistoryEntry[]
  apiUrl: ApiUrlObject
  editorConfig: EditorConfig
  darkMode: DarkModeConfig
  noteDetails: NoteDetails
  uiNotifications: UiNotificationState
  rendererStatus: RendererStatus
}

export const allReducers: Reducer<ApplicationState> = combineReducers<ApplicationState>({
  user: UserReducer,
  config: ConfigReducer,
  banner: BannerReducer,
  apiUrl: ApiUrlReducer,
  history: HistoryReducer,
  editorConfig: EditorConfigReducer,
  darkMode: DarkModeConfigReducer,
  noteDetails: NoteDetailsReducer,
  uiNotifications: UiNotificationReducer,
  rendererStatus: RendererStatusReducer
})

export const store = createStore(allReducers)
