/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { buildStateFromUpdatedMarkdownContent } from '../build-state-from-updated-markdown-content'
import { calculateLineStartIndexes } from '../calculate-line-start-indexes'
import { initialState } from '../initial-state'
import type { NoteDetails } from '../types'
import { buildStateFromMetadataUpdate } from './build-state-from-metadata-update'
import type { NoteDto } from '@hedgedoc/commons'

/**
 * Builds a {@link NoteDetails} redux state from a DTO received as an API response.
 * @param dto The first DTO received from the API containing the relevant information about the note.
 * @return An updated {@link NoteDetails} redux state.
 */
export const buildStateFromServerDto = (dto: NoteDto): NoteDetails => {
  const newState = convertNoteDtoToNoteDetails(dto)
  return buildStateFromUpdatedMarkdownContent(newState, newState.markdownContent.plain)
}

/**
 * Converts a note DTO from the HTTP API to a {@link NoteDetails} object.
 * Note that the documentContent will be set but the markdownContent and rawFrontmatterContent are yet to be processed.
 * @param note The NoteDTO as defined in the backend.
 * @return The NoteDetails object corresponding to the DTO.
 */
const convertNoteDtoToNoteDetails = (note: NoteDto): NoteDetails => {
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
