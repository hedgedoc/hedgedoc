/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Reducer } from 'redux'
import { combineReducers, createStore } from 'redux'
import type { Config } from '../api/config/types'
import { ApiUrlReducer } from './api-url/reducers'
import type { ApiUrlObject } from './api-url/types'
import { MotdReducer } from './motd/reducers'
import type { OptionalMotdState } from './motd/types'
import { ConfigReducer } from './config/reducers'
import { DarkModeConfigReducer } from './dark-mode/reducers'
import type { DarkModeConfig } from './dark-mode/types'
import { EditorConfigReducer } from './editor/reducers'
import type { EditorConfig } from './editor/types'
import { NoteDetailsReducer } from './note-details/reducer'
import type { NoteDetails } from './note-details/types'
import { UserReducer } from './user/reducers'
import type { OptionalUserState } from './user/types'
import type { UiNotificationState } from './ui-notifications/types'
import { UiNotificationReducer } from './ui-notifications/reducers'
import type { HistoryEntry } from './history/types'
import { HistoryReducer } from './history/reducers'
import { RendererStatusReducer } from './renderer-status/reducers'
import type { RendererStatus } from './renderer-status/types'
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly'

export interface ApplicationState {
  user: OptionalUserState
  config: Config
  motd: OptionalMotdState
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
  motd: MotdReducer,
  apiUrl: ApiUrlReducer,
  history: HistoryReducer,
  editorConfig: EditorConfigReducer,
  darkMode: DarkModeConfigReducer,
  noteDetails: NoteDetailsReducer,
  uiNotifications: UiNotificationReducer,
  rendererStatus: RendererStatusReducer
})

export const store = createStore(allReducers, composeWithDevTools())
