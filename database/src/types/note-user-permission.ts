/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 * Represents a permission for a {@link Note} to be accessed by a {@link User}.
 */
export interface NoteUserPermission {
  /** The id of the {@link User} to give the {@link Note} permission to. */
  [FieldNameNoteUserPermission.userId]: number

  /** The id of the {@link Note} to give the {@link User} permission to. */
  [FieldNameNoteUserPermission.noteId]: number

  /** Whether the {@link User} can edit the {@link Note} or not. */
  [FieldNameNoteUserPermission.canEdit]: boolean
}

export enum FieldNameNoteUserPermission {
  userId = 'user_id',
  noteId = 'note_id',
  canEdit = 'can_edit',
}

export const TableNoteUserPermission = 'note_user_permission'

export type TypeUpdateNoteUserPermission = Pick<
  NoteUserPermission,
  FieldNameNoteUserPermission.canEdit
>
