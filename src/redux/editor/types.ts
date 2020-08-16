import { Action } from 'redux'
import { EditorMode } from '../../components/editor/app-bar/editor-view-mode';

export enum EditorConfigActionType {
  SET_EDITOR_VIEW_MODE = 'editor/mode/set'
}

export interface EditorConfig {
  editorMode: EditorMode;
}

export interface EditorConfigActions extends Action<EditorConfigActionType> {
  type: EditorConfigActionType;
}

export interface SetEditorConfigAction extends EditorConfigActions {
  mode: EditorMode;
}
