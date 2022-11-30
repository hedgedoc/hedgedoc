/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ApplicationState } from './application-state'
import { ConfigReducer } from './config/reducers'
import { DarkModeConfigReducer } from './dark-mode/reducers'
import { EditorConfigReducer } from './editor/reducers'
import { HistoryReducer } from './history/reducers'
import { NoteDetailsReducer } from './note-details/reducer'
import { RealtimeReducer } from './realtime/reducers'
import { RendererStatusReducer } from './renderer-status/reducers'
import { UserReducer } from './user/reducers'
import type { Reducer } from 'redux'
import { combineReducers } from 'redux'

export const allReducers: Reducer<ApplicationState> = combineReducers<ApplicationState>({
  user: UserReducer,
  config: ConfigReducer,
  history: HistoryReducer,
  editorConfig: EditorConfigReducer,
  darkMode: DarkModeConfigReducer,
  noteDetails: NoteDetailsReducer,
  rendererStatus: RendererStatusReducer,
  realtime: RealtimeReducer
})
