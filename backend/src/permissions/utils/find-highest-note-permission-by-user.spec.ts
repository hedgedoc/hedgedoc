/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';

import { User } from '../../users/user.entity';
import { NotePermission } from '../note-permission.enum';
import { NoteUserPermission } from '../note-user-permission.entity';
import { findHighestNotePermissionByUser } from './find-highest-note-permission-by-user';

describe('find highest note permission by user', () => {
  const user1 = Mock.of<User>({ id: 0 });
  const user2 = Mock.of<User>({ id: 1 });
  const user3 = Mock.of<User>({ id: 2 });

  const permissionUser2Read = Mock.of<NoteUserPermission>({
    user: Promise.resolve(user2),
    canEdit: false,
  });

  const permissionUser3Read = Mock.of<NoteUserPermission>({
    user: Promise.resolve(user3),
    canEdit: false,
  });

  const permissionUser3Write = Mock.of<NoteUserPermission>({
    user: Promise.resolve(user3),
    canEdit: true,
  });

  it('will fallback to NONE if no permission for the user could be found', async () => {
    const result = await findHighestNotePermissionByUser(user1, [
      permissionUser2Read,
      permissionUser3Write,
    ]);
    expect(result).toBe(NotePermission.DENY);
  });

  it('can extract a READ permission for the correct user', async () => {
    const result = await findHighestNotePermissionByUser(user2, [
      permissionUser2Read,
      permissionUser3Write,
    ]);
    expect(result).toBe(NotePermission.READ);
  });

  it('can extract a WRITE permission for the correct user', async () => {
    const result = await findHighestNotePermissionByUser(user3, [
      permissionUser2Read,
      permissionUser3Write,
    ]);
    expect(result).toBe(NotePermission.WRITE);
  });

  it('can extract a WRITE permission for the correct user if read and write are defined', async () => {
    const result = await findHighestNotePermissionByUser(user3, [
      permissionUser2Read,
      permissionUser3Read,
      permissionUser3Write,
    ]);
    expect(result).toBe(NotePermission.WRITE);
  });
});
