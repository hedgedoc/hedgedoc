/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  getNotePermissionLevelDisplayName,
  NotePermissionLevel,
} from './note-permission.enum';

describe('note permission order', () => {
  it('DENY is less than READ', () => {
    expect(NotePermissionLevel.DENY < NotePermissionLevel.READ).toBeTruthy();
  });
  it('READ is less than WRITE', () => {
    expect(NotePermissionLevel.READ < NotePermissionLevel.WRITE).toBeTruthy();
  });
  it('WRITE is less than OWNER', () => {
    expect(NotePermissionLevel.WRITE < NotePermissionLevel.OWNER).toBeTruthy();
  });
});

describe('getNotePermissionDisplayName', () => {
  it.each([
    ['deny', NotePermissionLevel.DENY],
    ['read', NotePermissionLevel.READ],
    ['write', NotePermissionLevel.WRITE],
    ['owner', NotePermissionLevel.OWNER],
  ])('displays %s correctly', (displayName, permission) => {
    expect(getNotePermissionLevelDisplayName(permission)).toBe(displayName);
  });
});
