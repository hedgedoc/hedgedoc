/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isDevMode } from '../utils/test-modes'
import { configureStore } from '@reduxjs/toolkit'
import { darkModeReducer } from './dark-mode/slice'
import { editorConfigReducer } from './editor-config/slice'
import { userReducer } from './user/slice'
import { rendererStatusReducer } from './renderer-status/slice'
import { realtimeStatusReducer } from './realtime/slice'
import { historyReducer } from './history/slice'
import { noteDetailsReducer } from './note-details/slice'
import { printModeReducer } from './print-mode/slice'

export const store = configureStore({
  reducer: {
    darkMode: darkModeReducer,
    editorConfig: editorConfigReducer,
    user: userReducer,
    rendererStatus: rendererStatusReducer,
    realtimeStatus: realtimeStatusReducer,
    history: historyReducer,
    noteDetails: noteDetailsReducer,
    printMode: printModeReducer
  },
  devTools: isDevMode
})

export type ApplicationState = ReturnType<typeof store.getState>

export const getGlobalState = (): ApplicationState => store.getState()
