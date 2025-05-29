/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum PermissionLevel {
  /** Indicates that a user has no access to a note or object */
  DENY = 0,
  /** Indicates that a user has read-only access to a note or object */
  READ = 1,
  /** Indicates that a user has write access to a note or object, but this does not include deletion or permission change abilities */
  WRITE = 2,
  /**
   * Indicates that a user has full access to a note or object (they are the owner) including deletion or permission changes,
   * while for guests this includes note creation permissions
   */
  FULL = 3,
}

export const PermissionLevelNames = ['deny', 'read', 'write', 'full'] as const

export const PermissionLevelValues = {
  deny: PermissionLevel.DENY,
  read: PermissionLevel.READ,
  write: PermissionLevel.WRITE,
  full: PermissionLevel.FULL,
} as const
