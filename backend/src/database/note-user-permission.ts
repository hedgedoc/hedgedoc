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
  noteId: number;

  /** The id of the {@link Note} to give the {@link User} permission to. */
  userId: number;

  /** Whether the {@link User} can edit the {@link Note} or not. */
  canEdit: boolean;
}
