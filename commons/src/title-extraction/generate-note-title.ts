/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { NoteFrontmatter } from '../note-frontmatter/note-frontmatter.js'

/**
 * Generates the note title from the given frontmatter or the first heading in the markdown content.
 *
 * @param frontmatter The frontmatter of the note
 * @param firstHeadingProvider A function that provides the first heading of the markdown content
 * @param previousTitle The previous title to use as a fallback when the first heading is empty and no frontmatter title exists
 * @return The title from the frontmatter or, if no title is present in the frontmatter, the first heading.
 */
export const generateNoteTitle = (
  frontmatter: NoteFrontmatter | undefined,
  firstHeadingProvider: () => string | undefined,
  previousTitle?: string,
): string => {
  if (frontmatter?.title) {
    return frontmatter.title.trim()
  } else if (frontmatter?.opengraph.title) {
    return frontmatter?.opengraph.title.trim()
  } else {
    return (firstHeadingProvider() ?? '').trim() || previousTitle?.trim() || ''
  }
}
