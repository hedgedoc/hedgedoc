/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 * The AuthorshipInfo holds the information from where to where one {@link User} has changed a {@link Note}
 *
 * These AuthorshipInfos are combined in a {@link Revision}, which represents one save in the
 * {@link Note}'s change history.
 */
export interface AuthorshipInfo {
  /** The id of the {@link Revision} this belongs to. */
  revisionId: number;

  /** The id of the author of the edit. */
  authorId: number;

  /** The start position of the change in the note as a positive index. */
  startPos: number;

  /** The end position of the change in the note as a positive index. */
  endPos: number;

  /** The creation datetime of the edit. */
  createdAt: Date;
}
