/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useFrontendConfig } from '../../components/common/frontend-config-context/use-frontend-config'
import { useApplicationState } from './use-application-state'
import { useMemo } from 'react'
import { useDeferredState } from './use-deferred-state'

/**
 * Returns the markdown content from the global application state trimmed to the maximal note length and without the frontmatter lines.
 *
 * @return The array of markdown content lines
 */
export const useTrimmedNoteMarkdownContentWithoutFrontmatter = (): string[] => {
  const maxLength = useFrontendConfig().maxDocumentLength
  const markdownContent = useApplicationState((state) => ({
    lines: state.noteDetails.markdownContent.lines,
    content: state.noteDetails.markdownContent.plain
  }))
  const lineOffset = useApplicationState((state) => state.noteDetails.startOfContentLineOffset)

  const trimmedLines = useMemo(() => {
    if (markdownContent.content.length > maxLength) {
      return markdownContent.content.slice(0, maxLength).split('\n')
    } else {
      return markdownContent.lines
    }
  }, [markdownContent, maxLength])

  return useDeferredState(
    useMemo(() => trimmedLines.slice(lineOffset), [lineOffset, trimmedLines]),
    []
  )
}
