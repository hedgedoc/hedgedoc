/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { NoteDto } from '../../../api/notes/types'
import type { NoteDetails } from '../types/note-details'
import { buildStateFromUpdatedMarkdownContent } from '../build-state-from-updated-markdown-content'
import { initialState } from '../initial-state'
import { DateTime } from 'luxon'

/**
 * Builds a {@link NoteDetails} redux state from a DTO received as an API response.
 * @param dto The first DTO received from the API containing the relevant information about the note.
 * @return An updated {@link NoteDetails} redux state.
 */
export const buildStateFromServerDto = (dto: NoteDto): NoteDetails => {
  const newState = convertNoteDtoToNoteDetails(dto)
  return buildStateFromUpdatedMarkdownContent(newState, newState.markdownContent)
}

/**
 * Converts a note DTO from the HTTP API to a {@link NoteDetails} object.
 * Note that the documentContent will be set but the markdownContent and rawFrontmatterContent are yet to be processed.
 * @param note The NoteDTO as defined in the backend.
 * @return The NoteDetails object corresponding to the DTO.
 */
const convertNoteDtoToNoteDetails = (note: NoteDto): NoteDetails => {
  return {
    ...initialState,
    markdownContent: note.content,
    markdownContentLines: note.content.split('\n'),
    rawFrontmatter: '',
    id: note.metadata.id,
    createTime: DateTime.fromISO(note.metadata.createTime),
    lastChange: {
      username: note.metadata.updateUser.username,
      timestamp: DateTime.fromISO(note.metadata.updateTime)
    },
    viewCount: note.metadata.viewCount,
    alias: note.metadata.alias,
    authorship: note.metadata.editedBy
  }
}
