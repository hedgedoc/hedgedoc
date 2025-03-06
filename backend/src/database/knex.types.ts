/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Knex } from 'knex';

import { Alias } from './alias';
import { ApiToken } from './api-token';
import { AuthorshipInfo } from './authorship-info';
import { Group } from './group';
import { GroupUser } from './group-user';
import { Identity } from './identity';
import { MediaUpload } from './media-upload';
import { Note } from './note';
import { NoteGroupPermission } from './note-group-permission';
import { NoteUserPermission } from './note-user-permission';
import { Revision } from './revision';
import { RevisionTag } from './revision-tag';
import { User } from './user';
import { UserPinnedNote } from './user-pinned-note';

/* eslint-disable @typescript-eslint/naming-convention */
declare module 'knex/types/tables' {
  interface Tables {
    alias_composite: Knex.CompositeTableType<
      Alias,
      Alias,
      Pick<Alias, 'isPrimary'>
    >;
    api_token_composite: Knex.CompositeTableType<
      ApiToken,
      Omit<ApiToken, 'createdAt' | 'lastUsedAt'>,
      Pick<ApiToken, 'lastUsedAt'>
    >;
    authorship_info_composite: Knex.CompositeTableType<
      AuthorshipInfo,
      Omit<AuthorshipInfo, 'createdAt'>
    >;
    group_composite: Knex.CompositeTableType<
      Group,
      Omit<Group, 'id'>,
      Pick<Group, 'name' | 'displayName'>
    >;
    group_user_composite: Knex.CompositeTableType<GroupUser>;
    identity_composite: Knex.CompositeTableType<
      Identity,
      Omit<Identity, 'createdAt'>,
      Pick<Identity, 'passwordHash' | 'updatedAt'>
    >;
    media_upload_composite: Knex.CompositeTableType<
      MediaUpload,
      Omit<MediaUpload, 'createdAt' | 'uuid'>,
      Pick<MediaUpload, 'noteId'>
    >;
    note_composite: Knex.CompositeTableType<
      Note,
      Omit<Note, 'createdAt' | 'id'>,
      Pick<Note, 'ownerId'>
    >;
    note_group_permission_composite: Knex.CompositeTableType<
      NoteGroupPermission,
      NoteGroupPermission,
      Pick<NoteGroupPermission, 'canEdit'>
    >;
    note_user_permission_composite: Knex.CompositeTableType<
      NoteUserPermission,
      NoteUserPermission,
      Pick<NoteUserPermission, 'canEdit'>
    >;
    revision_composite: Knex.CompositeTableType<
      Revision,
      Omit<Revision, 'createdAt' | 'id'>
    >;
    revision_tag_composite: Knex.CompositeTableType<RevisionTag>;
    user_composite: Knex.CompositeTableType<
      User,
      Omit<User, 'id' | 'createdAt'>,
      Pick<User, 'displayName' | 'photoUrl' | 'email' | 'authorStyle'>
    >;
    user_pinned_note_composite: Knex.CompositeTableType<UserPinnedNote>;
  }
}
