/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Knex } from 'knex';

import {
  Alias,
  ApiToken,
  AuthorshipInfo,
  FieldNameAlias,
  FieldNameApiToken,
  FieldNameGroup,
  FieldNameIdentity,
  FieldNameMediaUpload,
  FieldNameNote,
  FieldNameNoteGroupPermission,
  FieldNameNoteUserPermission,
  FieldNameRevision,
  FieldNameUser,
  Group,
  GroupUser,
  Identity,
  MediaUpload,
  Note,
  NoteGroupPermission,
  NoteUserPermission,
  Revision,
  RevisionTag,
  TableAlias,
  TableApiToken,
  TableAuthorshipInfo,
  TableGroup,
  TableGroupUser,
  TableIdentity,
  TableMediaUpload,
  TableNote,
  TableNoteGroupPermission,
  TableNoteUserPermission,
  TableRevision,
  TableRevisionTag,
  TableUser,
  TableUserPinnedNote,
  User,
  UserPinnedNote,
} from './index';

/* eslint-disable @typescript-eslint/naming-convention */
declare module 'knex/types/tables.js' {
  interface Tables {
    [TableAlias]: Knex.CompositeTableType<
      Alias,
      Alias,
      Pick<Alias, FieldNameAlias.isPrimary>
    >;
    [TableApiToken]: Knex.CompositeTableType<
      ApiToken,
      Omit<ApiToken, FieldNameApiToken.lastUsedAt>,
      Pick<ApiToken, FieldNameApiToken.lastUsedAt>
    >;
    [TableAuthorshipInfo]: AuthorshipInfo;
    [TableGroup]: Knex.CompositeTableType<
      Group,
      Omit<Group, FieldNameGroup.id>,
      Pick<Group, FieldNameGroup.name | FieldNameGroup.displayName>
    >;
    [TableGroupUser]: GroupUser;
    [TableIdentity]: Knex.CompositeTableType<
      Identity,
      Omit<Identity, FieldNameIdentity.createdAt | FieldNameIdentity.updatedAt>,
      Pick<
        Identity,
        FieldNameIdentity.passwordHash | FieldNameIdentity.updatedAt
      >
    >;
    [TableMediaUpload]: Knex.CompositeTableType<
      MediaUpload,
      Omit<
        MediaUpload,
        FieldNameMediaUpload.createdAt | FieldNameMediaUpload.uuid
      >,
      Pick<MediaUpload, FieldNameMediaUpload.noteId>
    >;
    [TableNote]: Knex.CompositeTableType<
      Note,
      Omit<Note, FieldNameNote.createdAt | FieldNameNote.id>,
      Pick<Note, FieldNameNote.ownerId>
    >;
    [TableNoteGroupPermission]: Knex.CompositeTableType<
      NoteGroupPermission,
      NoteGroupPermission,
      Pick<NoteGroupPermission, FieldNameNoteGroupPermission.canEdit>
    >;
    [TableNoteUserPermission]: Knex.CompositeTableType<
      NoteUserPermission,
      NoteUserPermission,
      Pick<NoteUserPermission, FieldNameNoteUserPermission.canEdit>
    >;
    [TableRevision]: Knex.CompositeTableType<
      Revision,
      Omit<Revision, FieldNameRevision.createdAt | FieldNameRevision.id>
    >;
    [TableRevisionTag]: RevisionTag;
    [TableUser]: Knex.CompositeTableType<
      User,
      Omit<User, FieldNameUser.id | FieldNameUser.createdAt>,
      Pick<
        User,
        | FieldNameUser.displayName
        | FieldNameUser.photoUrl
        | FieldNameUser.email
        | FieldNameUser.authorStyle
      >
    >;
    [TableUserPinnedNote]: UserPinnedNote;
  }
}
