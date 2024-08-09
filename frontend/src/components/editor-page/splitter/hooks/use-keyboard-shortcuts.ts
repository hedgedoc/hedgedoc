/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react'
import { setEditorSplitPosition } from '../../../../redux/editor-config/methods'

/**
 * Binds global keyboard shortcuts for setting the split value.
 */
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const shortcutHandler = (event: KeyboardEvent): void => {
      if (event.ctrlKey && event.altKey && event.key === 'b') {
        setEditorSplitPosition(50)
        event.preventDefault()
      }

      if (event.ctrlKey && event.altKey && event.key === 'v') {
        setEditorSplitPosition(0)
        event.preventDefault()
      }

      if (event.ctrlKey && event.altKey && (event.key === 'e' || event.key === '€')) {
        setEditorSplitPosition(100)
        event.preventDefault()
      }
    }

    document.addEventListener('keydown', shortcutHandler, false)
    return () => {
      document.removeEventListener('keydown', shortcutHandler, false)
    }
  }, [])
}
