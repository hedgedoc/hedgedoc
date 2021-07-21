/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { EditorConfiguration } from 'codemirror'
import { store } from '..'
import { EditorMode } from '../../components/editor-page/app-bar/editor-view-mode'
import {
  EditorConfig,
  EditorConfigActionType,
  SetEditorLigaturesAction,
  SetEditorPreferencesAction,
  SetEditorSmartPasteAction,
  SetEditorSyncScrollAction,
  SetEditorViewModeAction
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
  const action: SetEditorViewModeAction = {
    type: EditorConfigActionType.SET_EDITOR_VIEW_MODE,
    mode: editorMode
  }
  store.dispatch(action)
}

export const setEditorSyncScroll = (syncScroll: boolean): void => {
  const action: SetEditorSyncScrollAction = {
    type: EditorConfigActionType.SET_SYNC_SCROLL,
    syncScroll
  }
  store.dispatch(action)
}

export const setEditorLigatures = (ligatures: boolean): void => {
  const action: SetEditorLigaturesAction = {
    type: EditorConfigActionType.SET_LIGATURES,
    ligatures
  }
  store.dispatch(action)
}

export const setEditorSmartPaste = (smartPaste: boolean): void => {
  const action: SetEditorSmartPasteAction = {
    type: EditorConfigActionType.SET_SMART_PASTE,
    smartPaste
  }
  store.dispatch(action)
}

export const mergeEditorPreferences = (preferences: EditorConfiguration): void => {
  const action: SetEditorPreferencesAction = {
    type: EditorConfigActionType.MERGE_EDITOR_PREFERENCES,
    preferences
  }
  store.dispatch(action)
}
