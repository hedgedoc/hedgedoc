/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 * Represents a permission for a {@link Note} to be accessed by a {@link Group}.
 */
export interface NoteGroupPermission {
  /** The id of the {@link Group} to give the {@link Note} permission to. */
  groupId: number;

  /** The id of the {@link Note} to give the {@link Group} permission to. */
  noteId: number;

  /** Whether the {@link Group} can edit the {@link Note} or not. */
  canEdit: boolean;
}
