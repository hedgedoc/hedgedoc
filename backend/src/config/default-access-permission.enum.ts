/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum DefaultAccessPermission {
  NONE = 'none',
  READ = 'read',
  WRITE = 'write',
}

export function getDefaultAccessPermissionOrdinal(
  permission: DefaultAccessPermission,
): number {
  switch (permission) {
    case DefaultAccessPermission.NONE:
      return 0;
    case DefaultAccessPermission.READ:
      return 1;
    case DefaultAccessPermission.WRITE:
      return 2;
    default:
      throw Error('Unknown permission');
  }
}
