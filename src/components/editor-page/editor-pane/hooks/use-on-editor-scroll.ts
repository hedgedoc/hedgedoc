/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { DomEvent } from 'react-codemirror2'
import { useCallback, useEffect, useState } from 'react'
import { Editor, ScrollInfo } from 'codemirror'
import { ScrollState } from '../../synced-scroll/scroll-props'

/**
 * Creates a callback for the scroll binding of the code mirror editor.
 * It calculates a {@link ScrollState} and posts it on change.
 *
 * @param onScroll The callback that is used to post the {@link ScrolLState}.
 * @return The callback for the code mirror scroll binding.
 */
export const useOnEditorScroll = (onScroll?: (scrollState: ScrollState) => void): DomEvent => {
  const [editorScrollState, setEditorScrollState] = useState<ScrollState>()

  useEffect(() => {
    if (onScroll && editorScrollState) {
      onScroll(editorScrollState)
    }
  }, [editorScrollState, onScroll])

  return useCallback(
    (editor: Editor, scrollInfo: ScrollInfo) => {
      if (!editor || !onScroll || !scrollInfo) {
        return
      }
      const line = editor.lineAtHeight(scrollInfo.top, 'local')
      const startYOfLine = editor.heightAtLine(line, 'local')
      const lineInfo = editor.lineInfo(line)
      if (lineInfo === null) {
        return
      }
      const heightOfLine = (lineInfo.handle as { height: number }).height
      const percentageRaw = Math.max(scrollInfo.top - startYOfLine, 0) / heightOfLine
      const percentage = Math.floor(percentageRaw * 100)

      setEditorScrollState({ firstLineInView: line + 1, scrolledPercentage: percentage })
    },
    [onScroll]
  )
}
