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
  [FieldNameApiToken.id]: string

  /** The {@link User} whose permissions the token has */
  [FieldNameApiToken.userId]: number

  /** The user-defined label for the token, such as "CLI" */
  [FieldNameApiToken.label]: string

  /** Hashed version of the token's secret */
  [FieldNameApiToken.secretHash]: string

  /** Expiry date of the token */
  [FieldNameApiToken.validUntil]: string

  /** Date when the API token was created */
  [FieldNameApiToken.createdAt]: string

  /** When the token was last used. When it was never used yet, this field is null */
  [FieldNameApiToken.lastUsedAt]: string | null
}

export enum FieldNameApiToken {
  id = 'id',
  userId = 'user_id',
  label = 'label',
  secretHash = 'secret_hash',
  validUntil = 'valid_until',
  createdAt = 'created_at',
  lastUsedAt = 'last_used_at',
}

export const TableApiToken = 'api_token'

type TypeApiTokenDate = Omit<
  ApiToken,
  | FieldNameApiToken.validUntil
  | FieldNameApiToken.createdAt
  | FieldNameApiToken.lastUsedAt
> & {
  [FieldNameApiToken.validUntil]: Date
  [FieldNameApiToken.createdAt]: Date
  [FieldNameApiToken.lastUsedAt]: Date | null
}

export type TypeInsertApiToken = Omit<
  TypeApiTokenDate,
  FieldNameApiToken.lastUsedAt
>
export type TypeUpdateApiToken = Pick<
  TypeApiTokenDate,
  FieldNameApiToken.lastUsedAt
>
