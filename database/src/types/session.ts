/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AuthProviderType } from './identity'

/**
 * Database representation of a session
 */
export interface Session {
  /** The session ID (primary key) */
  [FieldNameSession.id]: string

  /** The CSRF token for the current session */
  [FieldNameSession.csrfToken]: string | null

  /** The user ID associated with this session (foreign key to user table) */
  [FieldNameSession.userId]: number | null

  /** The auth provider that is used for the current login */
  [FieldNameSession.loginAuthProviderType]: AuthProviderType | null

  /** The identifier of the auth provider that is used for the current login */
  [FieldNameSession.loginAuthProviderIdentifier]: string | null

  /** The OIDC ID token used during authentication, for logout */
  [FieldNameSession.oidcIdToken]: string | null

  /** The OIDC secret code for verifying authentication callback */
  [FieldNameSession.oidcLoginCode]: string | null

  /** The OIDC state value for verifying authentication callback */
  [FieldNameSession.oidcLoginState]: string | null

  /** The OIDC session ID (sid) for OIDC provider backchannel logout */
  [FieldNameSession.oidcSid]: string | null

  /** JSON representation of the pending user data on registration */
  [FieldNameSession.pendingUserData]: string

  /** Timestamp when the session was created */
  [FieldNameSession.createdAt]: string

  /** Timestamp when the session was last updated */
  [FieldNameSession.updatedAt]: string

  /** Timestamp when the session expires */
  [FieldNameSession.expiresAt]: string
}

/**
 * Field names of the {@link Session} table
 */
export enum FieldNameSession {
  id = 'id',
  userId = 'user_id',
  csrfToken = 'csrf_token',
  loginAuthProviderType = 'login_auth_provider_type',
  loginAuthProviderIdentifier = 'login_auth_provider_identifier',
  oidcIdToken = 'oidc_id_token',
  oidcLoginCode = 'oidc_login_code',
  oidcLoginState = 'oidc_login_state',
  oidcSid = 'oidc_sid',
  pendingUserData = 'pending_user_data',
  createdAt = 'created_at',
  updatedAt = 'updated_at',
  expiresAt = 'expires_at',
}

/**
 * Name of the session table
 */
export const TableSession = 'session'
