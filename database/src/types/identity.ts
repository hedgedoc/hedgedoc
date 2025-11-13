/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum AuthProviderType {
  GUEST = 'guest',
  TOKEN = 'token',
  LOCAL = 'local',
  LDAP = 'ldap',
  OIDC = 'oidc',
}

/**
 * An auth identity holds the information how a {@link User} can authenticate themselves using a certain auth provider
 */
export interface Identity {
  /** The id of the user */
  [FieldNameIdentity.userId]: number

  /** The type of the auth provider */
  [FieldNameIdentity.providerType]: AuthProviderType

  /** The identifier of the auth provider, e.g. gitlab */
  [FieldNameIdentity.providerIdentifier]: string | null

  /** Timestamp when this identity was created */
  [FieldNameIdentity.createdAt]: string

  /** Timestamp when this identity was last updated */
  [FieldNameIdentity.updatedAt]: string

  /** The remote id of the user at the auth provider or null for local identities */
  [FieldNameIdentity.providerUserId]: string | null

  /** The hashed password for local identities or null for other auth providers */
  [FieldNameIdentity.passwordHash]: string | null
}

export enum FieldNameIdentity {
  userId = 'user_id',
  providerType = 'provider_type',
  providerIdentifier = 'provider_identifier',
  createdAt = 'created_at',
  updatedAt = 'updated_at',
  providerUserId = 'provider_user_id',
  passwordHash = 'password_hash',
}

export const TableIdentity = 'identity'

export type TypeUpdateIdentity = Pick<
  Identity,
  FieldNameIdentity.passwordHash | FieldNameIdentity.updatedAt
>
