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
  id: number;

  /** The {@link User} id of the note owner */
  ownerId: string;

  /** The HedgeDoc major version this note was created in. This is used to migrate certain features from HD1 to HD2 */
  version: number;

  /** Timestamp when the note was created */
  createdAt: Date;
}
