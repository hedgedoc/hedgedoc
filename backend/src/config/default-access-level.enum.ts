/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum DefaultAccessLevel {
  NONE = 'none',
  READ = 'read',
  WRITE = 'write',
}

export function getDefaultAccessLevelOrdinal(
  permission: DefaultAccessLevel,
): number {
  switch (permission) {
    case DefaultAccessLevel.NONE:
      return 0;
    case DefaultAccessLevel.READ:
      return 1;
    case DefaultAccessLevel.WRITE:
      return 2;
    default:
      throw Error('Unknown permission');
  }
}
