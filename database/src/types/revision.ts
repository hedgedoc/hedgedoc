/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum NoteType {
  DOCUMENT = 'document',
  SLIDE = 'slide',
}

/**
 * A revision represents the content of a {@link Note} at a specific point in time.
 */
export interface Revision {
  /** The unique id of the revision for internal referencing */
  [FieldNameRevision.uuid]: string

  /** The id of the note that this revision belongs to */
  [FieldNameRevision.noteId]: number

  /** The changes between this revision and the previous one in patch file format */
  [FieldNameRevision.patch]: string

  /** The content of the note at this revision */
  [FieldNameRevision.content]: string

  /** The stored Y.js state for realtime editing */
  [FieldNameRevision.yjsStateVector]: null | ArrayBuffer

  /** Whether the note is a document or presentation at this revision */
  [FieldNameRevision.noteType]: NoteType

  /** The extracted note title from this revision */
  [FieldNameRevision.title]: string

  /** The extracted description from this revision */
  [FieldNameRevision.description]: string

  /** Timestamp when this revision was created */
  [FieldNameRevision.createdAt]: string
}

export enum FieldNameRevision {
  uuid = 'uuid',
  noteId = 'note_id',
  patch = 'patch',
  content = 'content',
  yjsStateVector = 'yjs_state_vector',
  noteType = 'note_type',
  title = 'title',
  description = 'description',
  createdAt = 'created_at',
}

export const TableRevision = 'revision'

type TypeRevisionDate = Omit<Revision, FieldNameRevision.createdAt> & {
  [FieldNameRevision.createdAt]: Date
}

export type TypeInsertRevision = Omit<
  TypeRevisionDate,
  FieldNameRevision.createdAt
>
