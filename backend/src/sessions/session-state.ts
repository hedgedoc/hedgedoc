/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AuthProviderType } from '@hedgedoc/commons';
import type { PendingUserInfoDto } from '../dtos/pending-user-info.dto';

interface OidcAuthSessionState {
  /** The id token to identify a user session with an OIDC auth provider, required for the logout */
  idToken: string | null;

  /** The (random) OIDC code for verifying that OIDC responses match the OIDC requests */
  loginCode: string | null;

  /** The (random) OIDC state for verifying that OIDC responses match the OIDC requests */
  loginState: string | null;

  /** The session ID from the OIDC provider, used for backchannel logout */
  sid: string | null;
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
  cookie?: {
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

  /** The current session owner's CSRF token */
  csrfToken: string | null;

  /** Contains the username if logged in completely, is null when not being logged in */
  userId: number | null;

  /** The auth provider that is used for the current login */
  loginAuthProviderType: AuthProviderType | null;

  /** The identifier of the auth provider that is used for the current login */
  loginAuthProviderIdentifier: string | null;

  /** Session data used on OIDC login */
  oidc: OidcAuthSessionState;

  /** The user data of the user that is currently being created */
  pendingUser: PendingUserSessionState | null;
}
