/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * A group represents one or multiple {@link User}s and can be used for permission management.
 * There are special groups that are created by the system and cannot be deleted, these include the set of all
 * registered users, as well as all unauthenticated users.
 */
export interface Group {
  /** The unique id for internal referencing */
  id: number;

  /** The public identifier of the group (username for the group) */
  name: string;

  /** The display name of the group */
  displayName: string;

  /** Whether the group is one of the special groups */
  isSpecial: boolean;
}
