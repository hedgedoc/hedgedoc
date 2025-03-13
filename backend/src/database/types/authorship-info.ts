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
  [FieldNameAuthorshipInfo.revisionId]: number;

  /** The id of the author of the edit. */
  [FieldNameAuthorshipInfo.authorId]: number;

  /** The start position of the change in the note as a positive index. */
  [FieldNameAuthorshipInfo.startPosition]: number;

  /** The end position of the change in the note as a positive index. */
  [FieldNameAuthorshipInfo.endPosition]: number;
}

export enum FieldNameAuthorshipInfo {
  revisionId = 'revision_id',
  authorId = 'author_id',
  startPosition = 'start_position',
  endPosition = 'end_position',
}

export const TableAuthorshipInfo = 'authorship_info';
