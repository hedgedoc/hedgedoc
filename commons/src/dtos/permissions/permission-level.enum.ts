/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum PermissionLevel {
  DENY = 'deny',
  READ = 'read',
  WRITE = 'write',
  CREATE = 'create',
}

export const getPermissionLevelValue = (
  permissionLevel: PermissionLevel,
): number => {
  switch (permissionLevel) {
    case PermissionLevel.DENY:
      return 0
    case PermissionLevel.READ:
      return 1
    case PermissionLevel.WRITE:
      return 2
    case PermissionLevel.CREATE:
      return 3
    default:
      throw Error('Unknown permission')
  }
}
