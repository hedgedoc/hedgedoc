/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { EditorConfiguration } from 'codemirror'
import type { Action } from 'redux'
import type { EditorMode } from '../../components/editor-page/app-bar/editor-view-mode'

export enum EditorConfigActionType {
  SET_EDITOR_VIEW_MODE = 'editor/view-mode/set',
  SET_SYNC_SCROLL = 'editor/syncScroll/set',
  MERGE_EDITOR_PREFERENCES = 'editor/preferences/merge',
  SET_LIGATURES = 'editor/preferences/setLigatures',
  SET_SMART_PASTE = 'editor/preferences/setSmartPaste'
}

export interface EditorConfig {
  editorMode: EditorMode
  syncScroll: boolean
  ligatures: boolean
  smartPaste: boolean
  preferences: EditorConfiguration
}

export type EditorConfigActions =
  | SetEditorSyncScrollAction
  | SetEditorLigaturesAction
  | SetEditorSmartPasteAction
  | SetEditorViewModeAction
  | SetEditorPreferencesAction

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

export interface SetEditorPreferencesAction extends Action<EditorConfigActionType> {
  type: EditorConfigActionType.MERGE_EDITOR_PREFERENCES
  preferences: EditorConfiguration
}
