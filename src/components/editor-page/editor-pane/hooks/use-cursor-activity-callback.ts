/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Editor } from 'codemirror'
import { useCallback } from 'react'
import type { CursorPosition } from '../../../../redux/editor/types'
import { updateCursorPositions } from '../../../../redux/note-details/methods'

/**
 * Provides a callback for codemirror that handles cursor changes
 *
 * @return the generated callback
 */
export const useCursorActivityCallback = (): ((editor: Editor) => void) => {
  return useCallback((editor) => {
    const firstSelection = editor.listSelections()[0]
    if (firstSelection === undefined) {
      return
    }
    const start: CursorPosition = { line: firstSelection.from().line, character: firstSelection.from().ch }
    const end: CursorPosition = { line: firstSelection.to().line, character: firstSelection.to().ch }
    updateCursorPositions({
      from: start,
      to: start.line === end.line && start.character === end.character ? undefined : end
    })
  }, [])
}
