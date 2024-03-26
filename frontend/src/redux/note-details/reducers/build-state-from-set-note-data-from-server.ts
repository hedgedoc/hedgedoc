/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Note } from '../../../api/notes/types'
import { buildStateFromUpdatedMarkdownContent } from '../build-state-from-updated-markdown-content'
import { calculateLineStartIndexes } from '../calculate-line-start-indexes'
import { initialState } from '../initial-state'
import type { NoteDetails } from '../types'
import { buildStateFromMetadataUpdate } from './build-state-from-metadata-update'

/**
 * Builds a {@link NoteDetails} redux state from a DTO received as an API response.
 * @param dto The first DTO received from the API containing the relevant information about the note.
 * @return An updated {@link NoteDetails} redux state.
 */
export const buildStateFromServerDto = (dto: Note): NoteDetails => {
  const newState = convertNoteDtoToNoteDetails(dto)
  return buildStateFromUpdatedMarkdownContent(newState, newState.markdownContent.plain)
}

/**
 * Converts a note DTO from the HTTP API to a {@link NoteDetails} object.
 * Note that the documentContent will be set but the markdownContent and rawFrontmatterContent are yet to be processed.
 * @param note The NoteDTO as defined in the backend.
 * @return The NoteDetails object corresponding to the DTO.
 */
const convertNoteDtoToNoteDetails = (note: Note): NoteDetails => {
  const stateWithMetadata = buildStateFromMetadataUpdate(initialState, note.metadata)
  const newLines = note.content.split('\n')
  return {
    ...stateWithMetadata,
    markdownContent: {
      plain: note.content,
      lines: newLines,
      lineStartIndexes: calculateLineStartIndexes(newLines)
    },
    rawFrontmatter: ''
  }
}
