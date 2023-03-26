/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useFrontendConfig } from '../../components/common/frontend-config-context/use-frontend-config'
import { useNoteDetails } from './use-note-details'
import { useMemo } from 'react'

/**
 * Returns the markdown content from the global application state trimmed to the maximal note length and without the frontmatter lines.
 *
 * @return The array of markdown content lines
 */
export const useTrimmedNoteMarkdownContentWithoutFrontmatter = (): string[] => {
  const maxLength = useFrontendConfig().maxDocumentLength
  const lines = useNoteDetails().markdownContent.lines
  const content = useNoteDetails().markdownContent.plain
  const lineOffset = useNoteDetails().frontmatterRendererInfo.lineOffset

  const trimmedLines = useMemo(() => {
    if (content.length > maxLength) {
      return content.slice(0, maxLength).split('\n')
    } else {
      return lines
    }
  }, [content, lines, maxLength])

  return useMemo(() => {
    return trimmedLines.slice(lineOffset)
  }, [lineOffset, trimmedLines])
}
