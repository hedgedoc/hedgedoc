/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NotePermissionLevel } from '../note-permission.enum';
import { convertEditabilityToPermissionLevel } from './convert-editability-to-note-permission-level';

describe('convert editability to note permission level', () => {
  it('canEdit false is converted to read', () => {
    expect(convertEditabilityToPermissionLevel(false)).toBe(
      NotePermissionLevel.READ,
    );
  });
  it('canEdit true is converted to write', () => {
    expect(convertEditabilityToPermissionLevel(true)).toBe(
      NotePermissionLevel.WRITE,
    );
  });
});
