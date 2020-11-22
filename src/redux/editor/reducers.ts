/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Reducer } from 'redux'
import { EditorMode } from '../../components/editor/app-bar/editor-view-mode'
import { loadFromLocalStorage, saveToLocalStorage } from './methods'
import {
  EditorConfig,
  EditorConfigActions,
  EditorConfigActionType,
  SetEditorConfigAction,
  SetEditorPreferencesAction,
  SetEditorSyncScrollAction
} from './types'

const initialState: EditorConfig = {
  editorMode: EditorMode.BOTH,
  syncScroll: true,
  preferences: {
    theme: 'one-dark',
    keyMap: 'sublime',
    indentUnit: 4,
    indentWithTabs: false
  }
}

const getInitialState = (): EditorConfig => {
  return loadFromLocalStorage() ?? initialState
}

export const EditorConfigReducer: Reducer<EditorConfig, EditorConfigActions> = (state: EditorConfig = getInitialState(), action: EditorConfigActions) => {
  let newState: EditorConfig
  switch (action.type) {
    case EditorConfigActionType.SET_EDITOR_VIEW_MODE:
      newState = {
        ...state,
        editorMode: (action as SetEditorConfigAction).mode
      }
      saveToLocalStorage(newState)
      return newState
    case EditorConfigActionType.SET_SYNC_SCROLL:
      newState = {
        ...state,
        syncScroll: (action as SetEditorSyncScrollAction).syncScroll
      }
      saveToLocalStorage(newState)
      return newState
    case EditorConfigActionType.SET_EDITOR_PREFERENCES:
      newState = {
        ...state,
        preferences: (action as SetEditorPreferencesAction).preferences
      }
      saveToLocalStorage(newState)
      return newState
    default:
      return state
  }
}
