import { setEditorMode } from '../../../redux/editor/methods'
import { EditorMode } from '../app-bar/editor-view-mode'

export const shortcutHandler = (event: KeyboardEvent): void => {
  if (event.ctrlKey && event.altKey && event.key === 'b') {
    setEditorMode(EditorMode.BOTH)
    event.preventDefault()
  }

  if (event.ctrlKey && event.altKey && event.key === 'v') {
    setEditorMode(EditorMode.PREVIEW)
    event.preventDefault()
  }

  if (event.ctrlKey && event.altKey && (event.key === 'e' || event.key === '€')) {
    setEditorMode(EditorMode.EDITOR)
    event.preventDefault()
  }
}
