/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'

export enum EditorConfigActionType {
  SET_EDITOR_VIEW_MODE = 'editor/view-mode/set',
  SET_SYNC_SCROLL = 'editor/syncScroll/set',
  SET_LIGATURES = 'editor/preferences/setLigatures',
  SET_SMART_PASTE = 'editor/preferences/setSmartPaste',
  SET_SPELL_CHECK = 'editor/preferences/setSpellCheck'
}

export interface EditorConfig {
  syncScroll: boolean
  ligatures: boolean
  smartPaste: boolean
  spellCheck: boolean
}

export type EditorConfigActions =
  | SetEditorSyncScrollAction
  | SetEditorLigaturesAction
  | SetEditorSmartPasteAction
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

export interface SetSpellCheckAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.SET_SPELL_CHECK
  spellCheck: boolean
}
