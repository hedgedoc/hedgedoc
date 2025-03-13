/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ProviderType } from '../../auth/provider-type.enum';

/**
 * An auth identity holds the information how a {@link User} can authenticate themselves using a certain auth provider
 */
export interface Identity {
  /** The id of the user */
  [FieldNameIdentity.userId]: number;

  /** The type of the auth provider */
  [FieldNameIdentity.providerType]: ProviderType;

  /** The identifier of the auth provider, e.g. gitlab */
  [FieldNameIdentity.providerIdentifier]: string | null;

  /** Timestamp when this identity was created */
  [FieldNameIdentity.createdAt]: Date;

  /** Timestamp when this identity was last updated */
  [FieldNameIdentity.updatedAt]: Date;

  /** The remote id of the user at the auth provider or null for local identities */
  [FieldNameIdentity.providerUserId]: string | null;

  /** The hashed password for local identities or null for other auth providers */
  [FieldNameIdentity.passwordHash]: string | null;
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

export const TableIdentity = 'identity';
