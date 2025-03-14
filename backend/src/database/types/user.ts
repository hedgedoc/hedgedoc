/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * The user object represents either a registered user in the instance or a guest user.
 *
 * Registered users have a unique username and a display name. They can authenticate using auth identities
 * attached to their account. A registered user can have one or more auth identities.
 *
 * Guest users are anonymous users that are only identified by a guest UUID. They have a limited set of features
 * available and cannot authenticate otherwise than with their UUID. Anonymous note creation or media uploads
 * create a guest user, or use an existing one if the UUID is known by the browser. The reason for guest users
 * is to allow them to delete their own notes and media files without the need to register an account.
 */
export interface User {
  /** The unique id of the user for internal referencing */
  [FieldNameUser.id]: number;

  /** The user's chosen username or null if it is a guest user */
  [FieldNameUser.username]: string | null;

  /** The guest user's UUID or null if it is a registered user */
  [FieldNameUser.guestUuid]: string | null;

  /** The user's chosen display name */
  [FieldNameUser.displayName]: string;

  /** Timestamp when the user was created */
  [FieldNameUser.createdAt]: Date;

  /** URL to the user's profile picture if present */
  [FieldNameUser.photoUrl]: string | null;

  /** The user's email address if present */
  [FieldNameUser.email]: string | null;

  /** The index which author style (e.g. color) should be used for this user */
  [FieldNameUser.authorStyle]: number;
}

export const enum FieldNameUser {
  id = 'id',
  username = 'username',
  guestUuid = 'guest_uuid',
  displayName = 'display_name',
  createdAt = 'created_at',
  photoUrl = 'photo_url',
  email = 'email',
  authorStyle = 'author_style',
}

export const TableUser = 'user';

export type TypeInsertUser = Omit<
  User,
  FieldNameUser.id | FieldNameUser.createdAt
>;
export type TypeUpdateUser = Pick<
  User,
  | FieldNameUser.displayName
  | FieldNameUser.photoUrl
  | FieldNameUser.email
  | FieldNameUser.authorStyle
>;
