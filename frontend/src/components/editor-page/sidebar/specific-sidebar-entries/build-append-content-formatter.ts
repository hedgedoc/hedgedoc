/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ContentFormatter } from '../../change-content-context/use-change-editor-content-callback'

/**
 * Builds an editor formatter that appends imported content to a note.
 *
 * @param content Content to append.
 * @returns Formatter that inserts the content at the end of the current document.
 */
export const buildAppendContentFormatter = (content: string): ContentFormatter => {
  return ({ markdownContent }) => {
    const contentWithSeparator = (markdownContent.length === 0 ? '' : '\n') + content
    return [
      [
        {
          from: markdownContent.length,
          to: markdownContent.length,
          insert: contentWithSeparator
        }
      ],
      undefined
    ]
  }
}
