/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Mock } from 'ts-mockery';

import { Group } from '../../groups/group.entity';
import { SpecialGroup } from '../../groups/groups.special';
import { User } from '../../users/user.entity';
import { NoteGroupPermission } from '../note-group-permission.entity';
import { NotePermission } from '../note-permission.enum';
import { findHighestNotePermissionByGroup } from './find-highest-note-permission-by-group';

describe('find highest note permission by group', () => {
  const user1 = Mock.of<User>({ id: 0 });
  const user2 = Mock.of<User>({ id: 1 });
  const user3 = Mock.of<User>({ id: 2 });
  const group2 = Mock.of<Group>({
    id: 1,
    special: false,
    members: Promise.resolve([user2]),
  });
  const group3 = Mock.of<Group>({
    id: 2,
    special: false,
    members: Promise.resolve([user3]),
  });

  const permissionGroup2Read = Mock.of<NoteGroupPermission>({
    group: Promise.resolve(group2),
    canEdit: false,
  });

  const permissionGroup3Read = Mock.of<NoteGroupPermission>({
    group: Promise.resolve(group3),
    canEdit: false,
  });

  const permissionGroup3Write = Mock.of<NoteGroupPermission>({
    group: Promise.resolve(group3),
    canEdit: true,
  });

  describe('normal groups', () => {
    it('will fallback to NONE if no permission for the user could be found', async () => {
      const result = await findHighestNotePermissionByGroup(user1, [
        permissionGroup2Read,
        permissionGroup3Write,
      ]);
      expect(result).toBe(NotePermission.DENY);
    });

    it('can extract a READ permission for the correct user', async () => {
      const result = await findHighestNotePermissionByGroup(user2, [
        permissionGroup2Read,
        permissionGroup3Write,
      ]);
      expect(result).toBe(NotePermission.READ);
    });

    it('can extract a WRITE permission for the correct user', async () => {
      const result = await findHighestNotePermissionByGroup(user3, [
        permissionGroup2Read,
        permissionGroup3Write,
      ]);
      expect(result).toBe(NotePermission.WRITE);
    });

    it('can extract a WRITE permission for the correct user if read and write are defined', async () => {
      const result = await findHighestNotePermissionByGroup(user3, [
        permissionGroup2Read,
        permissionGroup3Read,
        permissionGroup3Write,
      ]);
      expect(result).toBe(NotePermission.WRITE);
    });
  });

  describe('special group', () => {
    const groupEveryone = Mock.of<Group>({
      id: 3,
      special: true,
      name: SpecialGroup.EVERYONE,
    });
    const groupLoggedIn = Mock.of<Group>({
      id: 4,
      special: true,
      name: SpecialGroup.LOGGED_IN,
    });
    const permissionGroupEveryoneRead = Mock.of<NoteGroupPermission>({
      group: Promise.resolve(groupEveryone),
      canEdit: false,
    });
    const permissionGroupLoggedInRead = Mock.of<NoteGroupPermission>({
      group: Promise.resolve(groupLoggedIn),
      canEdit: false,
    });
    const permissionGroupEveryoneWrite = Mock.of<NoteGroupPermission>({
      group: Promise.resolve(groupEveryone),
      canEdit: true,
    });
    const permissionGroupLoggedInWrite = Mock.of<NoteGroupPermission>({
      group: Promise.resolve(groupLoggedIn),
      canEdit: true,
    });

    it('will ignore unknown special groups', async () => {
      const nonsenseSpecialGroup = Mock.of<Group>({
        id: 99,
        special: true,
        name: 'Unknown Special Group',
        members: Promise.resolve([]),
      });

      const permissionUnknownSpecialGroup = Mock.of<NoteGroupPermission>({
        group: Promise.resolve(nonsenseSpecialGroup),
        canEdit: false,
      });

      const result = await findHighestNotePermissionByGroup(user1, [
        permissionUnknownSpecialGroup,
      ]);
      expect(result).toBe(NotePermission.DENY);
    });

    it('can extract the READ permission for logged in users', async () => {
      const result = await findHighestNotePermissionByGroup(user1, [
        permissionGroupLoggedInRead,
      ]);
      expect(result).toBe(NotePermission.READ);
    });

    it('can extract the READ permission for everyone', async () => {
      const result = await findHighestNotePermissionByGroup(user1, [
        permissionGroupEveryoneRead,
      ]);
      expect(result).toBe(NotePermission.READ);
    });
    it('can extract the WRITE permission for logged in users', async () => {
      const result = await findHighestNotePermissionByGroup(user1, [
        permissionGroupLoggedInWrite,
      ]);
      expect(result).toBe(NotePermission.WRITE);
    });

    it('can extract the WRITE permission for everyone', async () => {
      const result = await findHighestNotePermissionByGroup(user1, [
        permissionGroupEveryoneWrite,
      ]);
      expect(result).toBe(NotePermission.WRITE);
    });

    it('can prefer everyone over logged in if necessary', async () => {
      const result = await findHighestNotePermissionByGroup(user1, [
        permissionGroupEveryoneWrite,
        permissionGroupLoggedInRead,
      ]);
      expect(result).toBe(NotePermission.WRITE);
    });

    it('can prefer normal groups over logged in if necessary', async () => {
      const result = await findHighestNotePermissionByGroup(user3, [
        permissionGroup3Write,
        permissionGroupLoggedInRead,
      ]);
      expect(result).toBe(NotePermission.WRITE);
    });

    it('can prefer normal groups over everyone if necessary', async () => {
      const result = await findHighestNotePermissionByGroup(user3, [
        permissionGroup3Write,
        permissionGroupEveryoneRead,
      ]);
      expect(result).toBe(NotePermission.WRITE);
    });

    it('can prefer logged in over normal groups if necessary', async () => {
      const result = await findHighestNotePermissionByGroup(user3, [
        permissionGroup3Read,
        permissionGroupLoggedInWrite,
      ]);
      expect(result).toBe(NotePermission.WRITE);
    });

    it('can prefer everyone over normal groups if necessary', async () => {
      const result = await findHighestNotePermissionByGroup(user3, [
        permissionGroup3Read,
        permissionGroupEveryoneWrite,
      ]);
      expect(result).toBe(NotePermission.WRITE);
    });
  });
});
