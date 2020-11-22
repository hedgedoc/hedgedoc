/*
 * SPDX-FileCopyrightText: 2020 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Action } from 'redux'

export enum UserActionType {
  SET_USER = 'user/set',
  CLEAR_USER = 'user/clear'
}

export interface UserActions extends Action<UserActionType> {
  type: UserActionType;
}

export interface SetUserAction extends UserActions {
  state: UserState;
}

export type ClearUserAction = UserActions

export interface UserState {
  id: string;
  name: string;
  photo: string;
  provider: LoginProvider;
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

export type MaybeUserState = (UserState | null)
