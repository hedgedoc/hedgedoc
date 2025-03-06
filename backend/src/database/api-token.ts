/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * An API token can be used to access the public API.
 * A token can be created by a {@link User} and is valid until a specified date, at most two years in the future.
 * A token has the following format: hd2.<id>.<secret>
 */
export interface ApiToken {
  /** The id of the token, a short random ASCII string. Is unique */
  id: string;

  /** The {@link User} whose permissions the token has */
  userId: number;

  /** The user-defined label for the token, such as "CLI" */
  label: string;

  /** Hashed version of the token's secret */
  secretHash: string;

  /** Expiry date of the token */
  validUntil: Date;

  /** When the token was last used. When it was never used yet, this field is null */
  lastUsedAt: Date | null;
}
