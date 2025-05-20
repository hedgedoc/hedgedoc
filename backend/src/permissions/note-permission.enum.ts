/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Defines if a user can access a note and if yes how much power they have.
 */
export enum NotePermissionLevel {
  DENY = 0,
  READ = 1,
  WRITE = 2,
  OWNER = 3,
}

/**
 * Returns the display name for the given {@link NotePermissionLevel}.
 *
 * @param {NotePermissionLevel} value the note permission to display
 * @returns The display name
 */
export function getNotePermissionLevelDisplayName(
  value: NotePermissionLevel,
): string {
  switch (value) {
    case NotePermissionLevel.DENY:
      return 'deny';
    case NotePermissionLevel.READ:
      return 'read';
    case NotePermissionLevel.WRITE:
      return 'write';
    case NotePermissionLevel.OWNER:
      return 'owner';
  }
}
