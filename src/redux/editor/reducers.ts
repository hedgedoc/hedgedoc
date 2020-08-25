import { Reducer } from 'redux'
import {
  EditorConfig,
  EditorConfigActions,
  EditorConfigActionType,
  SetEditorConfigAction,
  SetEditorSyncScrollAction
} from './types'
import { EditorMode } from '../../components/editor/app-bar/editor-view-mode'

export const initialState: EditorConfig = {
  editorMode: EditorMode.BOTH,
  syncScroll: true
}

export const EditorConfigReducer: Reducer<EditorConfig, EditorConfigActions> = (state: EditorConfig = initialState, action: EditorConfigActions) => {
  switch (action.type) {
    case EditorConfigActionType.SET_EDITOR_VIEW_MODE:
      return {
        ...state,
        editorMode: (action as SetEditorConfigAction).mode
      }
    case EditorConfigActionType.SET_SYNC_SCROLL:
      return {
        ...state,
        syncScroll: (action as SetEditorSyncScrollAction).syncScroll
      }
    default:
      return state
  }
}
