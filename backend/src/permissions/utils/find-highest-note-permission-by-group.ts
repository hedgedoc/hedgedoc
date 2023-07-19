/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Group } from '../../groups/group.entity';
import { SpecialGroup } from '../../groups/groups.special';
import { User } from '../../users/user.entity';
import { NoteGroupPermission } from '../note-group-permission.entity';
import { NotePermission } from '../note-permission.enum';

/**
 * Inspects the given note permissions and finds the highest {@link NoteGroupPermission} for the given {@link Group}.
 *
 * @param user The group whose permissions should be determined
 * @param groupPermissions The search basis
 * @return The found permission or {@link NotePermission.DENY} if no permission could be found.
 * @async
 */
export async function findHighestNotePermissionByGroup(
  user: User,
  groupPermissions: NoteGroupPermission[],
): Promise<NotePermission.DENY | NotePermission.READ | NotePermission.WRITE> {
  let highestGroupPermission = NotePermission.DENY;
  for (const groupPermission of groupPermissions) {
    const permission = await findNotePermissionByGroup(user, groupPermission);
    if (permission === NotePermission.WRITE) {
      return NotePermission.WRITE;
    }
    highestGroupPermission =
      highestGroupPermission > permission ? highestGroupPermission : permission;
  }
  return highestGroupPermission;
}

async function findNotePermissionByGroup(
  user: User,
  groupPermission: NoteGroupPermission,
): Promise<NotePermission.DENY | NotePermission.READ | NotePermission.WRITE> {
  const group = await groupPermission.group;
  if (!isSpecialGroup(group) && !(await isUserInGroup(user, group))) {
    return NotePermission.DENY;
  }
  return groupPermission.canEdit ? NotePermission.WRITE : NotePermission.READ;
}

function isSpecialGroup(group: Group): boolean {
  return (
    group.special &&
    (group.name === (SpecialGroup.LOGGED_IN as string) ||
      group.name === (SpecialGroup.EVERYONE as string))
  );
}

async function isUserInGroup(user: User, group: Group): Promise<boolean> {
  for (const member of await group.members) {
    if (member.id === user.id) {
      return true;
    }
  }
  return false;
}
