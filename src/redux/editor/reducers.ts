/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Reducer } from 'redux'
import { EditorMode } from '../../components/editor-page/app-bar/editor-view-mode'
import { loadFromLocalStorage, saveToLocalStorage } from './methods'
import type { EditorConfig, EditorConfigActions } from './types'
import { EditorConfigActionType } from './types'

const initialState: EditorConfig = {
  editorMode: EditorMode.BOTH,
  ligatures: true,
  syncScroll: true,
  smartPaste: true,
  spellCheck: false
}

const getInitialState = (): EditorConfig => {
  return { ...initialState, ...loadFromLocalStorage() }
}

export const EditorConfigReducer: Reducer<EditorConfig, EditorConfigActions> = (
  state: EditorConfig = getInitialState(),
  action: EditorConfigActions
) => {
  let newState: EditorConfig
  switch (action.type) {
    case EditorConfigActionType.SET_EDITOR_VIEW_MODE:
      newState = {
        ...state,
        editorMode: action.mode
      }
      saveToLocalStorage(newState)
      return newState
    case EditorConfigActionType.SET_SYNC_SCROLL:
      newState = {
        ...state,
        syncScroll: action.syncScroll
      }
      saveToLocalStorage(newState)
      return newState
    case EditorConfigActionType.SET_LIGATURES:
      newState = {
        ...state,
        ligatures: action.ligatures
      }
      saveToLocalStorage(newState)
      return newState
    case EditorConfigActionType.SET_SMART_PASTE:
      newState = {
        ...state,
        smartPaste: action.smartPaste
      }
      saveToLocalStorage(newState)
      return newState
    case EditorConfigActionType.SET_SPELL_CHECK:
      newState = {
        ...state,
        spellCheck: action.spellCheck
      }
      saveToLocalStorage(newState)
      return newState
    default:
      return state
  }
}
