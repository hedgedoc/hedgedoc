/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export enum GuestAccess {
  DENY = 'deny',
  READ = 'read',
  WRITE = 'write',
  CREATE = 'create',
}

export const getGuestAccessOrdinal = (guestAccess: GuestAccess): number => {
  switch (guestAccess) {
    case GuestAccess.DENY:
      return 0
    case GuestAccess.READ:
      return 1
    case GuestAccess.WRITE:
      return 2
    case GuestAccess.CREATE:
      return 3
    default:
      throw Error('Unknown permission')
  }
}
