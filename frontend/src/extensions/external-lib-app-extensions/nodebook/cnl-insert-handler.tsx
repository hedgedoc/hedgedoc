/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useChangeEditorContentCallback } from '../../../components/editor-page/change-content-context/use-change-editor-content-callback'
import type React from 'react'
import { useCallback, useEffect } from 'react'

interface CnlInsertMessage {
  type: 'nodebook-insert-cnl'
  cnlLines: string[]
}

/**
 * Listens for 'nodebook-insert-cnl' postMessages from the renderer iframe
 * and inserts CNL lines into a nodeBook code fence in the editor.
 */
export const CnlInsertHandler: React.FC = () => {
  const changeEditorContent = useChangeEditorContentCallback()

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const data = event.data as CnlInsertMessage
      if (data?.type !== 'nodebook-insert-cnl' || !Array.isArray(data.cnlLines)) {
        return
      }
      if (!changeEditorContent) {
        return
      }

      const cnlLines = data.cnlLines
      changeEditorContent(({ markdownContent }) => {
        const insertResult = findInsertPosition(markdownContent, cnlLines)
        return [insertResult.edits, undefined]
      })
    },
    [changeEditorContent]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  return null
}

/**
 * Finds the right position to insert CNL lines:
 * 1. Look for an existing ```nodeBook fence after the last ```nodeBook-analyze fence
 * 2. If found, append lines before the closing ```
 * 3. If not found, create a new ```nodeBook fence after the analyze block
 */
function findInsertPosition(
  markdownContent: string,
  cnlLines: string[]
): { edits: Array<{ from: number; to: number; insert: string }> } {
  const lines = markdownContent.split('\n')
  let lastAnalyzeEnd = -1
  let nextNodeBookFenceEnd = -1

  // Find the last ```nodeBook-analyze closing fence
  let inAnalyze = false
  let charOffset = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimStart()
    if (trimmed.startsWith('```nodeBook-analyze')) {
      inAnalyze = true
    } else if (inAnalyze && trimmed === '```') {
      lastAnalyzeEnd = charOffset + line.length
      inAnalyze = false
    }
    charOffset += line.length + 1 // +1 for newline
  }

  if (lastAnalyzeEnd === -1) {
    // No analyze block found — append at end
    const insert = '\n\n```nodeBook\n' + cnlLines.join('\n') + '\n```\n'
    return {
      edits: [{ from: markdownContent.length, to: markdownContent.length, insert }]
    }
  }

  // Look for a ```nodeBook fence after the analyze block
  charOffset = 0
  let inNodeBook = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trimStart()
    if (charOffset >= lastAnalyzeEnd) {
      if (!inNodeBook && trimmed.startsWith('```nodeBook') && !trimmed.startsWith('```nodeBook-')) {
        inNodeBook = true
      } else if (inNodeBook && trimmed === '```') {
        nextNodeBookFenceEnd = charOffset
        break
      }
    }
    charOffset += line.length + 1
  }

  if (nextNodeBookFenceEnd !== -1) {
    // Append before the closing ``` of the existing nodeBook fence
    const insert = cnlLines.join('\n') + '\n'
    return {
      edits: [{ from: nextNodeBookFenceEnd, to: nextNodeBookFenceEnd, insert }]
    }
  }

  // No nodeBook fence after analyze — create one
  const insert = '\n\n```nodeBook\n' + cnlLines.join('\n') + '\n```\n'
  return {
    edits: [{ from: lastAnalyzeEnd, to: lastAnalyzeEnd, insert }]
  }
}
