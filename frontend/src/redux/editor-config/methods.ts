/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '..'
import { editorConfigActionsCreator } from './slice'
import type { EditorConfig } from './types'
import { initialState } from './initial-state'
import { updateObject } from '../../utils/update-object'
import { Logger } from '../../utils/logger'

const log = new Logger('Redux > EditorConfig')

export const setEditorSplitPosition = (splitPosition: number): void => {
  const action = editorConfigActionsCreator.setSplitPosition(splitPosition)
  store.dispatch(action)
  saveToLocalStorage()
}

export const setEditorSyncScroll = (syncScroll: boolean): void => {
  const action = editorConfigActionsCreator.setSyncScroll(syncScroll)
  store.dispatch(action)
  saveToLocalStorage()
}

export const setEditorLineWrapping = (lineWrapping: boolean): void => {
  const action = editorConfigActionsCreator.setLineWrapping(lineWrapping)
  store.dispatch(action)
  saveToLocalStorage()
}

export const setEditorLigatures = (ligatures: boolean): void => {
  const action = editorConfigActionsCreator.setLigatures(ligatures)
  store.dispatch(action)
  saveToLocalStorage()
}

export const setEditorSmartPaste = (smartPaste: boolean): void => {
  const action = editorConfigActionsCreator.setSmartPaste(smartPaste)
  store.dispatch(action)
  saveToLocalStorage()
}

export const setEditorSpellCheck = (spellCheck: boolean): void => {
  const action = editorConfigActionsCreator.setSpellCheck(spellCheck)
  store.dispatch(action)
  saveToLocalStorage()
}

export const setEditorIndentWithTabs = (indentWithTabs: boolean): void => {
  const action = editorConfigActionsCreator.setIndentWithTabs(indentWithTabs)
  store.dispatch(action)
  saveToLocalStorage()
}

export const setEditorIndentSpaces = (indentSpaces: number): void => {
  const action = editorConfigActionsCreator.setIndentSpaces(indentSpaces)
  store.dispatch(action)
  saveToLocalStorage()
}

export const loadFromLocalStorage = (): void => {
  try {
    const config = { ...initialState }
    const stored = window.localStorage.getItem('editorConfig')
    const parsed = stored ? (JSON.parse(stored) as Partial<EditorConfig>) : null
    updateObject(config, parsed)
    const action = editorConfigActionsCreator.setEditorConfig(config)
    store.dispatch(action)
  } catch (error) {
    log.error('Failed to load editor config from local storage', error)
  }
}

const saveToLocalStorage = (): void => {
  try {
    const state = store.getState()
    window.localStorage.setItem('editorConfig', JSON.stringify(state.editorConfig))
  } catch (error) {
    log.error('Failed to save editor config to local storage', error)
  }
}
