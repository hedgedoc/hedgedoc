/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType } from '@hedgedoc/commons';
import { FieldNameUser, User } from '@hedgedoc/database';

import { PendingUserInfoDto } from '../dtos/pending-user-info.dto';

interface OidcAuthSessionState {
  /** The id token to identify a user session with an OIDC auth provider, required for the logout */
  idToken?: string;

  /** The (random) OIDC code for verifying that OIDC responses match the OIDC requests */
  loginCode?: string;

  /** The (random) OIDC state for verifying that OIDC responses match the OIDC requests */
  loginState?: string;
}

interface PendingUserSessionState {
  /** The pending user confirmation data */
  confirmationData?: PendingUserInfoDto;

  /** The pending user auth provider type */
  authProviderType?: AuthProviderType;

  /** The pending user auth provider identifier */
  authProviderIdentifier?: string;

  /** The pending user id as provided from the external auth provider, required for matching to a HedgeDoc identity */
  providerUserId?: string;
}

export interface SessionState {
  /** Session cookie properties */
  cookie: {
    originalMaxAge: number | null;
    maxAge?: number;
    signed?: boolean;
    expires?: Date | null;
    httpOnly?: boolean;
    path?: string;
    domain?: string;
    secure?: boolean | 'auto';
    sameSite?: boolean | 'lax' | 'strict' | 'none';
  };

  /** Contains the username if logged in completely, is undefined when not being logged in */
  userId?: User[FieldNameUser.id];

  /** The auth provider that is used for the current login */
  authProviderType?: AuthProviderType;

  /** The identifier of the auth provider that is used for the current login */
  authProviderIdentifier?: string;

  /** Session data used on OIDC login */
  oidc?: OidcAuthSessionState;

  /** The user data of the user that is currently being created */
  pendingUser?: PendingUserSessionState;
}
