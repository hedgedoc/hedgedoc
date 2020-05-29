import {
  EditorMode,
  SET_EDITOR_CONFIG_MODE_ACTION_TYPE,
  SetEditorConfigAction
} from './types'
import { store } from '../../utils/store'

export const setEditorModeConfig = (editorMode: EditorMode): void => {
  const action: SetEditorConfigAction = {
    type: SET_EDITOR_CONFIG_MODE_ACTION_TYPE,
    payload: editorMode
  }
  store.dispatch(action)
}
