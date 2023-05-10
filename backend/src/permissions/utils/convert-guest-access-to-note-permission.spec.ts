/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { GuestAccess } from '../../config/guest_access.enum';
import { NotePermission } from '../note-permission.enum';
import { convertGuestAccessToNotePermission } from './convert-guest-access-to-note-permission';

describe('convert guest access to note permission', () => {
  it('no guest access means no note access', () => {
    expect(convertGuestAccessToNotePermission(GuestAccess.DENY)).toBe(
      NotePermission.DENY,
    );
  });

  it('translates read access to read permission', () => {
    expect(convertGuestAccessToNotePermission(GuestAccess.READ)).toBe(
      NotePermission.READ,
    );
  });

  it('translates write access to write permission', () => {
    expect(convertGuestAccessToNotePermission(GuestAccess.WRITE)).toBe(
      NotePermission.WRITE,
    );
  });

  it('translates create access to write permission', () => {
    expect(convertGuestAccessToNotePermission(GuestAccess.CREATE)).toBe(
      NotePermission.WRITE,
    );
  });
});
