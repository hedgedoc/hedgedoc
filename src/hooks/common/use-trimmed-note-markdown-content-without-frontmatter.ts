/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react'
import { useApplicationState } from './use-application-state'
import equal from 'fast-deep-equal'

/**
 * Returns the markdown content from the global application state trimmed to the maximal note length and without the frontmatter lines.
 */
export const useTrimmedNoteMarkdownContentWithoutFrontmatter = (): string[] => {
  const maxLength = useApplicationState((state) => state.config.maxDocumentLength)
  const markdownContent = useApplicationState(
    (state) => ({
      lines: state.noteDetails.markdownContentLines,
      content: state.noteDetails.markdownContent
    }),
    equal
  )
  const lineOffset = useApplicationState((state) => state.noteDetails.frontmatterRendererInfo.lineOffset)

  const trimmedLines = useMemo(() => {
    if (markdownContent.content.length > maxLength) {
      return markdownContent.content.slice(0, maxLength).split('\n')
    } else {
      return markdownContent.lines
    }
  }, [markdownContent, maxLength])

  return useMemo(() => {
    return trimmedLines.slice(lineOffset)
  }, [lineOffset, trimmedLines])
}
