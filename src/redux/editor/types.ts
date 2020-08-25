import { Action } from 'redux'
import { EditorMode } from '../../components/editor/app-bar/editor-view-mode'

export enum EditorConfigActionType {
  SET_EDITOR_VIEW_MODE = 'editor/mode/set',
  SET_SYNC_SCROLL = 'editor/syncScroll/set'
}

export interface EditorConfig {
  editorMode: EditorMode;
  syncScroll: boolean;
}

export interface EditorConfigActions extends Action<EditorConfigActionType> {
  type: EditorConfigActionType;
}

export interface SetEditorSyncScrollAction extends EditorConfigActions {
  syncScroll: boolean
}

export interface SetEditorConfigAction extends EditorConfigActions {
  mode: EditorMode
}
