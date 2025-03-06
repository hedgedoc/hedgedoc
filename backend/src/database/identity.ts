/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ProviderType } from '../auth/provider-type.enum';

/**
 * An auth identity holds the information how a {@link User} can authenticate themself using a certain auth provider
 */
export interface Identity {
  /** The id of the user */
  userId: number;

  /** The type of the auth provider */
  providerType: ProviderType;

  /** The identifier of the auth provider, e.g. gitlab */
  providerIdentifier: string | null;

  /** Timestamp when this identity was created */
  createdAt: Date;

  /** Timestamp when this identity was last updated */
  updatedAt: Date;

  /** The remote id of the user at the auth provider or null for local identities */
  providerUserId: string | null;

  /** The hashed password for local identities or null for other auth providers */
  passwordHash: string | null;
}
