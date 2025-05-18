/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { AuthProviderType, PendingUserInfoDto } from '@hedgedoc/commons';
import { Cookie } from 'express-session';

import { FieldNameUser, User } from '../database/types';

export interface SessionState {
  /** Details about the currently used session cookie */
  cookie: Cookie;

  /** Contains the username if logged in completely, is undefined when not being logged in */
  userId?: User[FieldNameUser.id];

  /** The auth provider that is used for the current login or pending login */
  authProviderType?: AuthProviderType;

  /** The identifier of the auth provider that is used for the current login or pending login */
  authProviderIdentifier?: string;

  /** The id token to identify a user session with an OIDC auth provider, required for the logout */
  oidcIdToken?: string;

  /** The (random) OIDC code for verifying that OIDC responses match the OIDC requests */
  oidcLoginCode?: string;

  /** The (random) OIDC state for verifying that OIDC responses match the OIDC requests */
  oidcLoginState?: string;

  /** The user id as provided from the external auth provider, required for matching to a HedgeDoc identity */
  providerUserId?: string;

  /** The user data of the user that is currently being created */
  newUserData?: PendingUserInfoDto;
}
