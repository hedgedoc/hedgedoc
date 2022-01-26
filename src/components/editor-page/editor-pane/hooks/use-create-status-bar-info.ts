/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { StatusBarInfo } from '../status-bar/status-bar'
import { useMemo } from 'react'
import { useApplicationState } from '../../../../hooks/common/use-application-state'

/**
 * Provides a {@link StatusBarInfo} object and a function that can update this object using a {@link CodeMirror code mirror instance}.
 */
export const useCreateStatusBarInfo = (): StatusBarInfo => {
  const maxDocumentLength = useApplicationState((state) => state.config.maxDocumentLength)
  const selection = useApplicationState((state) => state.noteDetails.selection)
  const markdownContent = useApplicationState((state) => state.noteDetails.markdownContent)
  const markdownContentLines = useApplicationState((state) => state.noteDetails.markdownContentLines)

  return useMemo(() => {
    const startCharacter = selection.from.character
    const endCharacter = selection.to?.character ?? 0
    const startLine = selection.from.line
    const endLine = selection.to?.line ?? 0

    return {
      position: { line: startLine, character: startCharacter },
      charactersInDocument: markdownContent.length,
      remainingCharacters: maxDocumentLength - markdownContent.length,
      linesInDocument: markdownContentLines.length,
      selectedColumns: endCharacter - startCharacter,
      selectedLines: endLine - startLine
    }
  }, [markdownContent.length, markdownContentLines.length, maxDocumentLength, selection])
}
