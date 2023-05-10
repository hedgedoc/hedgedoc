/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Defines if a user can access a note and if yes how much power they have.
 */
export enum NotePermission {
  DENY = 0,
  READ = 1,
  WRITE = 2,
  OWNER = 3,
}

/**
 * Returns the display name for the given {@link NotePermission}.
 *
 * @param {NotePermission} value the note permission to display
 * @return {string} The display name
 */
export function getNotePermissionDisplayName(value: NotePermission): string {
  switch (value) {
    case NotePermission.DENY:
      return 'deny';
    case NotePermission.READ:
      return 'read';
    case NotePermission.WRITE:
      return 'write';
    case NotePermission.OWNER:
      return 'owner';
  }
}
