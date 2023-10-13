/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { EditorConfig, EditorConfigActions } from './types'
import { EditorConfigActionType } from './types'
import type { Reducer } from 'redux'
import { Logger } from '../../utils/logger'

const logger = new Logger('EditorConfig Local Storage')

export const initialState: EditorConfig = {
  ligatures: true,
  syncScroll: true,
  smartPaste: true,
  spellCheck: true,
  lineWrapping: true,
  indentWithTabs: false,
  indentSpaces: 2
}

export const EditorConfigReducer: Reducer<EditorConfig, EditorConfigActions> = (
  state: EditorConfig = initialState,
  action: EditorConfigActions
) => {
  let newState: EditorConfig
  switch (action.type) {
    case EditorConfigActionType.LOAD_FROM_LOCAL_STORAGE:
      return loadFromLocalStorage() ?? initialState
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
    case EditorConfigActionType.SET_LINE_WRAPPING:
      newState = {
        ...state,
        lineWrapping: action.lineWrapping
      }
      saveToLocalStorage(newState)
      return newState
    case EditorConfigActionType.SET_INDENT_WITH_TABS:
      newState = {
        ...state,
        indentWithTabs: action.indentWithTabs
      }
      saveToLocalStorage(newState)
      return newState
    case EditorConfigActionType.SET_INDENT_SPACES:
      newState = {
        ...state,
        indentSpaces: action.indentSpaces
      }
      saveToLocalStorage(newState)
      return newState
    default:
      return state
  }
}

export const loadFromLocalStorage = (): EditorConfig | undefined => {
  try {
    const stored = window.localStorage.getItem('editorConfig')
    if (!stored) {
      return undefined
    }
    const storedConfiguration = JSON.parse(stored) as Partial<EditorConfig>
    return {
      ligatures: storedConfiguration?.ligatures === true ?? true,
      syncScroll: storedConfiguration?.syncScroll === true ?? true,
      smartPaste: storedConfiguration?.smartPaste === true ?? true,
      spellCheck: storedConfiguration?.spellCheck === true ?? true,
      lineWrapping: storedConfiguration?.lineWrapping === true ?? true,
      indentWithTabs: storedConfiguration?.indentWithTabs === true ?? false,
      indentSpaces: storedConfiguration?.indentSpaces ?? 2
    }
  } catch (_) {
    return undefined
  }
}

export const saveToLocalStorage = (editorConfig: EditorConfig): void => {
  try {
    const json = JSON.stringify(editorConfig)
    localStorage.setItem('editorConfig', json)
  } catch (error) {
    logger.error('Error while saving editor config in local storage', error)
  }
}
