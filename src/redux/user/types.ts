/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Action } from 'redux'

export enum UserActionType {
  SET_USER = 'user/set',
  CLEAR_USER = 'user/clear'
}

export type UserActions = SetUserAction | ClearUserAction

export interface SetUserAction extends Action<UserActionType> {
  type: UserActionType.SET_USER
  state: UserState
}

export interface ClearUserAction extends Action<UserActionType> {
  type: UserActionType.CLEAR_USER
}

export interface UserState {
  id: string
  name: string
  photo: string
  provider: LoginProvider
}

export enum LoginProvider {
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  TWITTER = 'twitter',
  GITLAB = 'gitlab',
  DROPBOX = 'dropbox',
  GOOGLE = 'google',
  SAML = 'saml',
  OAUTH2 = 'oauth2',
  INTERNAL = 'internal',
  LDAP = 'ldap',
  OPENID = 'openid'
}

export type OptionalUserState = UserState | null
