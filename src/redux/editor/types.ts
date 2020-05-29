import { Action } from 'redux'

export const SET_EDITOR_CONFIG_MODE_ACTION_TYPE = 'editor/mode/set'

export interface EditorConfigState {
    editorMode: EditorMode;
}

export enum EditorMode {
    PREVIEW,
    BOTH,
    EDITOR,
}

export interface SetEditorConfigAction extends Action {
    type: string;
    payload: EditorMode;
}

export type EditorConfigActions = SetEditorConfigAction;
