/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Username } from '../utils/username';

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
  id: number;

  /** The user's chosen username or null if it is a guest user */
  username: Username | null;

  /** The guest user's UUID or null if it is a registered user */
  guestUuid: string | null;

  /** The user's chosen display name */
  displayName: string;

  /** Timestamp when the user was created */
  createdAt: Date;

  /** URL to the user's profile picture if present */
  photoUrl: string | null;

  /** The user's email address if present */
  email: string | null;

  /** The index which author style (e.g. color) should be used for this user */
  authorStyle: number;
}
