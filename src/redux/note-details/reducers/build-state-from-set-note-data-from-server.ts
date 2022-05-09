/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NoteDetails } from '../types/note-details'
import { buildStateFromUpdatedMarkdownContent } from '../build-state-from-updated-markdown-content'
import { initialState } from '../initial-state'
import { DateTime } from 'luxon'
import { calculateLineStartIndexes } from '../calculate-line-start-indexes'
import type { Note } from '../../../api/notes/types'

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
  const newLines = note.content.split('\n')
  return {
    ...initialState,
    updateUsername: note.metadata.updateUsername,
    permissions: note.metadata.permissions,
    editedBy: note.metadata.editedBy,
    primaryAddress: note.metadata.primaryAddress,
    id: note.metadata.id,
    aliases: note.metadata.aliases,
    title: note.metadata.title,
    version: note.metadata.version,
    viewCount: note.metadata.viewCount,
    markdownContent: {
      plain: note.content,
      lines: newLines,
      lineStartIndexes: calculateLineStartIndexes(newLines)
    },
    rawFrontmatter: '',
    createdAt: DateTime.fromISO(note.metadata.createdAt).toSeconds(),
    updatedAt: DateTime.fromISO(note.metadata.updatedAt).toSeconds()
  }
}
