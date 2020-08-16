import { store } from '..'
import { EditorMode } from '../../components/editor/app-bar/editor-view-mode'
import { EditorConfigActionType, SetEditorConfigAction } from './types'

export const setEditorModeConfig = (editorMode: EditorMode): void => {
  const action: SetEditorConfigAction = {
    type: EditorConfigActionType.SET_EDITOR_VIEW_MODE,
    mode: editorMode
  }
  store.dispatch(action)
}
