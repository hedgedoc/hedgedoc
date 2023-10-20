/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useFrontendConfig } from '../../components/common/frontend-config-context/use-frontend-config'
import { useApplicationState } from './use-application-state'
import { useMemo } from 'react'

/**
 * Returns the markdown content from the global application state trimmed to the maximal note length and without the frontmatter lines.
 *
 * @return The array of markdown content lines
 */
export const useTrimmedNoteMarkdownContentWithoutFrontmatter = (): string[] => {
  const maxLength = useFrontendConfig().maxDocumentLength
  const markdownContent = useApplicationState((state) => {
    const noteDetails = state.noteDetails
    if (!noteDetails) {
      return undefined
    } else {
      return {
        lines: noteDetails.markdownContent.lines,
        content: noteDetails.markdownContent.plain
      }
    }
  })
  const lineOffset = useApplicationState((state) => state.noteDetails?.startOfContentLineOffset)

  const trimmedLines = useMemo(() => {
    if (!markdownContent) {
      return null
    }
    if (markdownContent.content.length > maxLength) {
      return markdownContent.content.slice(0, maxLength).split('\n')
    } else {
      return markdownContent.lines
    }
  }, [markdownContent, maxLength])

  return useMemo(() => {
    return trimmedLines === null || lineOffset === undefined ? [] : trimmedLines.slice(lineOffset)
  }, [lineOffset, trimmedLines])
}
