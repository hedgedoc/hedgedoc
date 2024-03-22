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
 * @return The sanitized filename
 */
export const useNoteFilename = (): string => {
  const title = useNoteTitle()
  return useMemo(() => `${sanitize(title)}.md`, [title])
}
