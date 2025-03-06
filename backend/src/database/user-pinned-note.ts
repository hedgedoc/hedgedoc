/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * A user-pinned-note object represents a {@link Note} that a {@link User} has pinned on their explore page.
 * Users can pin any arbitrary amount of notes.
 */
export interface UserPinnedNote {
  /** The id of the {@link User} */
  userId: number;

  /** The id of the {@link Note} */
  noteId: number;
}
