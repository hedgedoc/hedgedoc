/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useNoteDetails } from './use-note-details'

/**
 * Extracts the markdown content of the current note from the global application state.
 *
 * @return The markdown content of the note
 */
export const useNoteMarkdownContent = (): string => {
  return useNoteDetails().markdownContent.plain
}
