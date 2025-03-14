/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { PermissionLevel } from '@hedgedoc/commons';

import { NotePermissionLevel } from '../note-permission.enum';
import { convertPermissionLevelToNotePermissionLevel } from './convert-guest-access-to-note-permission-level';

describe('convert guest access to note permission', () => {
  it('no guest access means no note access', () => {
    expect(
      convertPermissionLevelToNotePermissionLevel(PermissionLevel.DENY),
    ).toBe(NotePermissionLevel.DENY);
  });

  it('translates read access to read permission', () => {
    expect(
      convertPermissionLevelToNotePermissionLevel(PermissionLevel.READ),
    ).toBe(NotePermissionLevel.READ);
  });

  it('translates write access to write permission', () => {
    expect(
      convertPermissionLevelToNotePermissionLevel(PermissionLevel.WRITE),
    ).toBe(NotePermissionLevel.WRITE);
  });

  it('translates create access to write permission', () => {
    expect(
      convertPermissionLevelToNotePermissionLevel(PermissionLevel.CREATE),
    ).toBe(NotePermissionLevel.WRITE);
  });
});
