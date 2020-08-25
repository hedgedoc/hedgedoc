import { store } from '..'
import { EditorMode } from '../../components/editor/app-bar/editor-view-mode'
import { EditorConfigActionType, SetEditorConfigAction, SetEditorSyncScrollAction } from './types'

export const setEditorMode = (editorMode: EditorMode): void => {
  const action: SetEditorConfigAction = {
    type: EditorConfigActionType.SET_EDITOR_VIEW_MODE,
    mode: editorMode
  }
  store.dispatch(action)
}

export const setEditorSyncScroll = (syncScroll: boolean): void => {
  const action: SetEditorSyncScrollAction = {
    type: EditorConfigActionType.SET_SYNC_SCROLL,
    syncScroll: syncScroll
  }
  store.dispatch(action)
}
