/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/**
 * All {@link RevisionTag Tags} that are associated with a {@link Revision}.
 */
export interface RevisionTag {
  /** The id of {@link Revision} the {@link RevisionTag Tags} are asspcoated with. */
  revisionId: number;

  /** The {@link RevisionTag Tag} text. */
  tag: string;
}
