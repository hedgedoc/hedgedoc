/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GuestAccess } from '@hedgedoc/commons';

import { NotePermission } from '../note-permission.enum';

/**
 * Converts the given guest access level to the highest possible {@link NotePermission}.
 *
 * @param guestAccess the guest access level to should be converted
 * @return the {@link NotePermission} representation
 */
export function convertGuestAccessToNotePermission(
  guestAccess: GuestAccess,
): NotePermission.READ | NotePermission.WRITE | NotePermission.DENY {
  switch (guestAccess) {
    case GuestAccess.DENY:
      return NotePermission.DENY;
    case GuestAccess.READ:
      return NotePermission.READ;
    case GuestAccess.WRITE:
      return NotePermission.WRITE;
    case GuestAccess.CREATE:
      return NotePermission.WRITE;
  }
}
