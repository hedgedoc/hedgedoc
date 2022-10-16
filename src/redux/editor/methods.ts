/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { store } from '..'
import type {
  EditorConfig,
  SetEditorLigaturesAction,
  SetEditorSmartPasteAction,
  SetEditorSyncScrollAction
} from './types'
import { EditorConfigActionType } from './types'
import { Logger } from '../../utils/logger'

const log = new Logger('Redux > Editor')

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
  } catch (error) {
    log.error('Error while saving editor config in local storage', error)
  }
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
