/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * A visited-note entry represents a {@link Note} that a {@link User} has opened.
 * Each visit is stored with a timestamp so we can query recently visited notes.
 */
export interface VisitedNote {
  /** The id of the {@link User} */
  user_id: number

  /** The id of the {@link Note} */
  note_id: number

  /** Timestamp when the note was visited */
  visited_at: string
}

export enum FieldNameVisitedNote {
  userId = 'user_id',
  noteId = 'note_id',
  visitedAt = 'visited_at',
}

export const TableVisitedNote = 'visited_notes'
