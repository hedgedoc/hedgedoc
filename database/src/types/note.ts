/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Notes are the central part of HedgeDoc. A note is accessed and identified by a list of aliases.
 * The note object itself only contains basic metadata about the note. The content is stored in note revisions.
 * The permission management is extracted into the note-user and note-group permission tables.
 */
export interface Note {
  /** The unique id of the note for internal referencing */
  [FieldNameNote.id]: number

  /** The {@link User} id of the note owner */
  [FieldNameNote.ownerId]: number

  /** The HedgeDoc major version this note was created in. This is used to migrate certain features from HD1 to HD2 */
  [FieldNameNote.version]: number

  /** Timestamp when the note was created */
  [FieldNameNote.createdAt]: string
}

export enum FieldNameNote {
  id = 'id',
  ownerId = 'owner_id',
  version = 'version',
  createdAt = 'created_at',
}

export const TableNote = 'note'

type TypeNoteDate = Omit<Note, FieldNameNote.createdAt> & {
  [FieldNameNote.createdAt]: Date
}

export type TypeInsertNote = Omit<
  TypeNoteDate,
  FieldNameNote.createdAt | FieldNameNote.id
>
export type TypeUpdateNote = Pick<TypeNoteDate, FieldNameNote.ownerId>
