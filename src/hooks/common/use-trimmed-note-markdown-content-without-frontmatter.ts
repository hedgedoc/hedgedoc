/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { useApplicationState } from './use-application-state'
import { useNoteMarkdownContent } from './use-note-markdown-content'

export const useTrimmedNoteMarkdownContentWithoutFrontmatter = (): string[] => {
  const maxLength = useApplicationState((state) => state.config.maxDocumentLength)
  const markdownContent = useNoteMarkdownContent()
  const markdownContentLines = useApplicationState((state) => state.noteDetails.markdownContentLines)
  const lineOffset = useApplicationState((state) => state.noteDetails.frontmatterRendererInfo.lineOffset)

  const trimmedLines = useMemo(() => {
    if (markdownContent.length > maxLength) {
      return markdownContent.slice(0, maxLength).split('\n')
    } else {
      return markdownContentLines
    }
  }, [markdownContent, markdownContentLines, maxLength])

  return useMemo(() => {
    return trimmedLines.slice(lineOffset)
  }, [lineOffset, trimmedLines])
}
