/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'
import type { EditorMode } from '../../components/editor-page/app-bar/editor-view-mode'

export enum EditorConfigActionType {
  SET_EDITOR_VIEW_MODE = 'editor/view-mode/set',
  SET_SYNC_SCROLL = 'editor/syncScroll/set',
  SET_LIGATURES = 'editor/preferences/setLigatures',
  SET_SMART_PASTE = 'editor/preferences/setSmartPaste',
  SET_SPELL_CHECK = 'editor/preferences/setSpellCheck'
}

export interface EditorConfig {
  editorMode: EditorMode
  syncScroll: boolean
  ligatures: boolean
  smartPaste: boolean
  spellCheck: boolean
}

export type EditorConfigActions =
  | SetEditorSyncScrollAction
  | SetEditorLigaturesAction
  | SetEditorSmartPasteAction
  | SetEditorViewModeAction
  | SetSpellCheckAction

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

export interface SetEditorViewModeAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.SET_EDITOR_VIEW_MODE
  mode: EditorMode
}

export interface SetSpellCheckAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.SET_SPELL_CHECK
  spellCheck: boolean
}
