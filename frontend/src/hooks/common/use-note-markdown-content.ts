/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useApplicationState } from './use-application-state'

/**
 * Extracts the markdown content of the current note from the global application state.
 *
 * @return The markdown content of the note
 */
export const useNoteMarkdownContent = (): string => {
  return useApplicationState((state) => state.noteDetails?.markdownContent.plain ?? '')
}
