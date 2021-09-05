/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useNoteMarkdownContent } from './use-note-markdown-content'
import { useApplicationState } from './use-application-state'
import { useMemo } from 'react'

/**
 * Extracts the markdown content of the current note from the global application state and removes the frontmatter.
 * @return the markdown content of the note without frontmatter
 */
export const useNoteMarkdownContentWithoutFrontmatter = (): string => {
  const markdownContent = useNoteMarkdownContent()
  const offsetLines = useApplicationState((state) => state.noteDetails.frontmatterRendererInfo.offsetLines)

  return useMemo(() => markdownContent.split('\n').slice(offsetLines).join('\n'), [markdownContent, offsetLines])
}
