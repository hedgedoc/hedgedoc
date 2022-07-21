/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'
import { setEditorMode } from '../../../redux/editor/methods'
import { EditorMode } from '../app-bar/editor-view-mode'

const shortcutHandler = (event: KeyboardEvent): void => {
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

/**
 * Adds global view mode keyboard shortcuts and removes them again, if the hook is dismissed.
 *
 * @see shortcutHandler
 */
export const useViewModeShortcuts = (): void => {
  useEffect(() => {
    document.addEventListener('keydown', shortcutHandler, false)
    return () => {
      document.removeEventListener('keydown', shortcutHandler, false)
    }
  }, [])
}
