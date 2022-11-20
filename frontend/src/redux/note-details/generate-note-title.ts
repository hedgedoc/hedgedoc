/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NoteFrontmatter } from './types/note-details'

/**
 * Generates the note title from the given frontmatter or the first heading in the markdown content.
 *
 * @param frontmatter The frontmatter of the note
 * @param firstHeading The first heading in the markdown content
 * @return The title from the frontmatter or, if no title is present in the frontmatter, the first heading.
 */
export const generateNoteTitle = (frontmatter: NoteFrontmatter, firstHeading?: string): string => {
  if (frontmatter?.title && frontmatter?.title !== '') {
    return frontmatter.title.trim()
  } else if (
    frontmatter?.opengraph &&
    frontmatter?.opengraph.title !== undefined &&
    frontmatter?.opengraph.title !== ''
  ) {
    return (frontmatter?.opengraph.title ?? firstHeading ?? '').trim()
  } else {
    return (firstHeading ?? '').trim()
  }
}
