/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect } from 'react'

/**
 * Binds global keyboard shortcuts for setting the split value.
 *
 * @param setRelativeSplitValue A function that is used to set the split value
 */
export const useKeyboardShortcuts = (setRelativeSplitValue: (value: number) => void) => {
  useEffect(() => {
    const shortcutHandler = (event: KeyboardEvent): void => {
      if (event.ctrlKey && event.altKey && event.key === 'b') {
        setRelativeSplitValue(50)
        event.preventDefault()
      }

      if (event.ctrlKey && event.altKey && event.key === 'v') {
        setRelativeSplitValue(0)
        event.preventDefault()
      }

      if (event.ctrlKey && event.altKey && (event.key === 'e' || event.key === '€')) {
        setRelativeSplitValue(100)
        event.preventDefault()
      }
    }

    document.addEventListener('keydown', shortcutHandler, false)
    return () => {
      document.removeEventListener('keydown', shortcutHandler, false)
    }
  }, [setRelativeSplitValue])
}
