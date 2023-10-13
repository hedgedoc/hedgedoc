/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Action } from 'redux'

export enum EditorConfigActionType {
  SET_SYNC_SCROLL = 'editor/syncScroll/set',
  LOAD_FROM_LOCAL_STORAGE = 'editor/preferences/load',
  SET_LIGATURES = 'editor/preferences/setLigatures',
  SET_LINE_WRAPPING = 'editor/preferences/setLineWrapping',
  SET_SMART_PASTE = 'editor/preferences/setSmartPaste',
  SET_SPELL_CHECK = 'editor/preferences/setSpellCheck',
  SET_INDENT_WITH_TABS = 'editor/preferences/setIndentWithTabs',
  SET_INDENT_SPACES = 'editor/preferences/setIndentSpaces'
}

export interface EditorConfig {
  syncScroll: boolean
  ligatures: boolean
  smartPaste: boolean
  spellCheck: boolean
  lineWrapping: boolean
  indentWithTabs: boolean
  indentSpaces: number
}

export type EditorConfigActions =
  | SetEditorSyncScrollAction
  | SetEditorLigaturesAction
  | SetEditorSmartPasteAction
  | SetEditorLineWrappingAction
  | SetEditorSpellCheckAction
  | SetEditorIndentWithTabsAction
  | SetEditorIndentSpacesAction
  | LoadFromLocalStorageAction

export interface LoadFromLocalStorageAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.LOAD_FROM_LOCAL_STORAGE
}

export interface SetEditorLineWrappingAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.SET_LINE_WRAPPING
  lineWrapping: boolean
}

export interface SetEditorSyncScrollAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.SET_SYNC_SCROLL
  syncScroll: boolean
}

export interface SetEditorLigaturesAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.SET_LIGATURES
  ligatures: boolean
}

export interface SetEditorSmartPasteAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.SET_SMART_PASTE
  smartPaste: boolean
}

export interface SetEditorSpellCheckAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.SET_SPELL_CHECK
  spellCheck: boolean
}

export interface SetEditorIndentWithTabsAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.SET_INDENT_WITH_TABS
  indentWithTabs: boolean
}

export interface SetEditorIndentSpacesAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.SET_INDENT_SPACES
  indentSpaces: number
}
