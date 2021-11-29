/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Injectable } from '@nestjs/common';

import { SpecialGroup } from '../groups/groups.special';
import { Note } from '../notes/note.entity';
import { User } from '../users/user.entity';

// TODO move to config or remove
export enum GuestPermission {
  DENY = 'deny',
  READ = 'read',
  WRITE = 'write',
  CREATE = 'create',
  CREATE_ALIAS = 'createAlias',
}

@Injectable()
export class PermissionsService {
  public guestPermission: GuestPermission; // TODO change to configOption
  mayRead(user: User | null, note: Note): boolean {
    if (this.isOwner(user, note)) return true;

    if (this.hasPermissionUser(user, note, false)) return true;

    // noinspection RedundantIfStatementJS
    if (this.hasPermissionGroup(user, note, false)) return true;

    return false;
  }

  mayWrite(user: User | null, note: Note): boolean {
    if (this.isOwner(user, note)) return true;

    if (this.hasPermissionUser(user, note, true)) return true;

    // noinspection RedundantIfStatementJS
    if (this.hasPermissionGroup(user, note, true)) return true;

    return false;
  }

  mayCreate(user: User | null): boolean {
    if (user) {
      return true;
    } else {
      if (
        this.guestPermission == GuestPermission.CREATE ||
        this.guestPermission == GuestPermission.CREATE_ALIAS
      ) {
        // TODO change to guestPermission to config option
        return true;
      }
    }
    return false;
  }

  isOwner(user: User | null, note: Note): boolean {
    if (!user) return false;
    if (!note.owner) return false;
    return note.owner.id === user.id;
  }

  private hasPermissionUser(
    user: User | null,
    note: Note,
    wantEdit: boolean,
  ): boolean {
    if (!user) {
      return false;
    }
    for (const userPermission of note.userPermissions) {
      if (
        userPermission.user.id === user.id &&
        (userPermission.canEdit || !wantEdit)
      ) {
        return true;
      }
    }
    return false;
  }

  private hasPermissionGroup(
    user: User | null,
    note: Note,
    wantEdit: boolean,
  ): boolean {
    // TODO: Get real config value
    let guestsAllowed = false;
    switch (this.guestPermission) {
      case GuestPermission.CREATE_ALIAS:
      case GuestPermission.CREATE:
      case GuestPermission.WRITE:
        guestsAllowed = true;
        break;
      case GuestPermission.READ:
        guestsAllowed = !wantEdit;
    }
    for (const groupPermission of note.groupPermissions) {
      if (groupPermission.canEdit || !wantEdit) {
        // Handle special groups
        if (groupPermission.group.special) {
          if (groupPermission.group.name == SpecialGroup.LOGGED_IN) {
            return true;
          }
          if (
            groupPermission.group.name == SpecialGroup.EVERYONE &&
            (groupPermission.canEdit || !wantEdit) &&
            guestsAllowed
          ) {
            return true;
          }
        } else {
          // Handle normal groups
          if (user) {
            for (const member of groupPermission.group.members) {
              if (member.id === user.id) return true;
            }
          }
        }
      }
    }
    return false;
  }
}
