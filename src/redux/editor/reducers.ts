import { Reducer } from 'redux'
import { EditorMode } from '../../components/editor/task-bar/editor-view-mode'
import { EditorConfig, EditorConfigActions, EditorConfigActionType, SetEditorConfigAction } from './types'

export const initialState: EditorConfig = {
  editorMode: EditorMode.BOTH
}

export const EditorConfigReducer: Reducer<EditorConfig, EditorConfigActions> = (state: EditorConfig = initialState, action: EditorConfigActions) => {
  switch (action.type) {
    case EditorConfigActionType.SET_EDITOR_VIEW_MODE:
      return {
        ...state,
        editorMode: (action as SetEditorConfigAction).mode
      }
    default:
      return state
  }
}
