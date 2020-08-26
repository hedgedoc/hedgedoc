import { setEditorMode } from '../../../redux/editor/methods'
import { EditorMode } from '../app-bar/editor-view-mode'

export const shortcutHandler = (event: KeyboardEvent): void => {
  if (event.ctrlKey && event.altKey && event.key === 'b') {
    setEditorMode(EditorMode.BOTH)
  }

  if (event.ctrlKey && event.altKey && event.key === 'v') {
    setEditorMode(EditorMode.PREVIEW)
  }

  if (event.ctrlKey && event.altKey && event.key === 'e') {
    setEditorMode(EditorMode.EDITOR)
  }
}
