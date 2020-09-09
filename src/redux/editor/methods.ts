import { EditorConfiguration } from 'codemirror'
import { store } from '..'
import { EditorMode } from '../../components/editor/app-bar/editor-view-mode'
import {
  EditorConfig,
  EditorConfigActionType,
  SetEditorConfigAction,
  SetEditorPreferencesAction,
  SetEditorSyncScrollAction
} from './types'

export const loadFromLocalStorage = (): EditorConfig | undefined => {
  try {
    const stored = window.localStorage.getItem('editorConfig')
    if (!stored) {
      return undefined
    }
    return JSON.parse(stored) as EditorConfig
  } catch (_) {
    return undefined
  }
}

export const saveToLocalStorage = (editorConfig: EditorConfig): void => {
  try {
    const json = JSON.stringify(editorConfig)
    localStorage.setItem('editorConfig', json)
  } catch (e) {
    console.error('Can not persist editor config in local storage: ', e)
  }
}

export const setEditorMode = (editorMode: EditorMode): void => {
  const action: SetEditorConfigAction = {
    type: EditorConfigActionType.SET_EDITOR_VIEW_MODE,
    mode: editorMode
  }
  store.dispatch(action)
}

export const setEditorSyncScroll = (syncScroll: boolean): void => {
  const action: SetEditorSyncScrollAction = {
    type: EditorConfigActionType.SET_SYNC_SCROLL,
    syncScroll: syncScroll
  }
  store.dispatch(action)
}

export const setEditorPreferences = (preferences: EditorConfiguration): void => {
  const action: SetEditorPreferencesAction = {
    type: EditorConfigActionType.SET_EDITOR_PREFERENCES,
    preferences: {
      ...preferences
    }
  }
  store.dispatch(action)
}
