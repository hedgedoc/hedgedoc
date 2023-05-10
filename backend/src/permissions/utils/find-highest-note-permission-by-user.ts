/*
 * SPDX-FileCopyrightText: 2023 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { User } from '../../users/user.entity';
import { NotePermission } from '../note-permission.enum';
import { NoteUserPermission } from '../note-user-permission.entity';

/**
 * Inspects the given note permissions and finds the highest {@link NoteUserPermission} for the given {@link User}.
 *
 * @param user The user whose permissions should be determined
 * @param userPermissions The search basis
 * @return The found permission or {@link NotePermission.DENY} if no permission could be found.
 * @async
 */
export async function findHighestNotePermissionByUser(
  user: User,
  userPermissions: NoteUserPermission[],
): Promise<NotePermission.DENY | NotePermission.READ | NotePermission.WRITE> {
  let hasReadPermission = false;
  for (const userPermission of userPermissions) {
    if ((await userPermission.user).id !== user.id) {
      continue;
    }

    if (userPermission.canEdit) {
      return NotePermission.WRITE;
    }

    hasReadPermission = true;
  }
  return hasReadPermission ? NotePermission.READ : NotePermission.DENY;
}
