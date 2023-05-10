/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  getNotePermissionDisplayName,
  NotePermission,
} from './note-permission.enum';

describe('note permission order', () => {
  it('DENY is less than READ', () => {
    expect(NotePermission.DENY < NotePermission.READ).toBeTruthy();
  });
  it('READ is less than WRITE', () => {
    expect(NotePermission.READ < NotePermission.WRITE).toBeTruthy();
  });
  it('WRITE is less than OWNER', () => {
    expect(NotePermission.WRITE < NotePermission.OWNER).toBeTruthy();
  });
});

describe('getNotePermissionDisplayName', () => {
  it.each([
    ['deny', NotePermission.DENY],
    ['read', NotePermission.READ],
    ['write', NotePermission.WRITE],
    ['owner', NotePermission.OWNER],
  ])('displays %s correctly', (displayName, permission) => {
    expect(getNotePermissionDisplayName(permission)).toBe(displayName);
  });
});
