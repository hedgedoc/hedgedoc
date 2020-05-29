import { Reducer } from 'redux'
import {
  EditorConfigActions,
  EditorConfigState,
  EditorMode,
  SET_EDITOR_CONFIG_MODE_ACTION_TYPE
} from './types'

export const initialState: EditorConfigState = {
  editorMode: EditorMode.PREVIEW
}

export const EditorConfigReducer: Reducer<EditorConfigState, EditorConfigActions> = (state: EditorConfigState = initialState, action: EditorConfigActions) => {
  switch (action.type) {
    case SET_EDITOR_CONFIG_MODE_ACTION_TYPE:
      return {
        ...state,
        editorMode: action.payload
      }
    default:
      return state
  }
}
