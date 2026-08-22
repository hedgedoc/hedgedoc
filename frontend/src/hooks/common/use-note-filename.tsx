/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react'
import { useNoteTitle } from './use-note-title'
import sanitize from 'sanitize-filename'

/**
 * Returns a sanitized filename for the current note based on the title.
 * When no title is provided, the filename will be "untitled".
 *
 * @param extension The file extension to use, defaults to md
 *
 * @return The sanitized filename
 */
export const useNoteFilename = (extension: string = 'md'): string => {
  const title = useNoteTitle()
  return useMemo(() => `${sanitize(title)}.${extension}`, [title, extension])
}
