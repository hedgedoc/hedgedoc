/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';

import { NotePermissionLevel } from '../note-permission.enum';

/**
 * Converts the given guest access level to the highest possible {@link NotePermissionLevel}.
 *
 * @param guestAccess the guest access level to should be converted
 * @returns the {@link NotePermissionLevel} representation
 */
export function convertPermissionLevelToNotePermissionLevel(
  guestAccess: PermissionLevel,
):
  | NotePermissionLevel.READ
  | NotePermissionLevel.WRITE
  | NotePermissionLevel.DENY {
  switch (guestAccess) {
    case PermissionLevel.DENY:
      return NotePermissionLevel.DENY;
    case PermissionLevel.READ:
      return NotePermissionLevel.READ;
    case PermissionLevel.WRITE:
      return NotePermissionLevel.WRITE;
    case PermissionLevel.CREATE:
      return NotePermissionLevel.WRITE;
  }
}
