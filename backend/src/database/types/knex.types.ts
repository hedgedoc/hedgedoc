/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  Alias,
  ApiToken,
  AuthorshipInfo,
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
  TypeInsertGroup,
  TypeInsertNote,
  TypeInsertUser,
  TypeUpdateAlias,
  TypeUpdateGroup,
  TypeUpdateIdentity,
  TypeUpdateMediaUpload,
  TypeUpdateNote,
  TypeUpdateNoteGroupPermission,
  TypeUpdateNoteUserPermission,
  TypeUpdateUser,
  User,
  UserPinnedNote,
} from '@hedgedoc/database';
import { Knex as KnexOriginal } from 'knex';

/* oxlint-disable @typescript-eslint/naming-convention */
declare module 'knex/types/tables.js' {
  interface Tables {
    [TableAlias]: KnexOriginal.CompositeTableType<Alias, Alias, TypeUpdateAlias>;
    [TableApiToken]: KnexOriginal.CompositeTableType<ApiToken>;
    [TableAuthorshipInfo]: KnexOriginal.CompositeTableType<AuthorshipInfo>;
    [TableGroup]: KnexOriginal.CompositeTableType<Group, TypeInsertGroup, TypeUpdateGroup>;
    [TableGroupUser]: GroupUser;
    [TableIdentity]: KnexOriginal.CompositeTableType<Identity, Identity, TypeUpdateIdentity>;
    [TableMediaUpload]: KnexOriginal.CompositeTableType<
      MediaUpload,
      MediaUpload,
      TypeUpdateMediaUpload
    >;
    [TableNote]: KnexOriginal.CompositeTableType<Note, TypeInsertNote, TypeUpdateNote>;
    [TableNoteGroupPermission]: KnexOriginal.CompositeTableType<
      NoteGroupPermission,
      NoteGroupPermission,
      TypeUpdateNoteGroupPermission
    >;
    [TableNoteUserPermission]: KnexOriginal.CompositeTableType<
      NoteUserPermission,
      NoteUserPermission,
      TypeUpdateNoteUserPermission
    >;
    [TableRevision]: KnexOriginal.CompositeTableType<Revision>;
    [TableRevisionTag]: RevisionTag;
    [TableUser]: KnexOriginal.CompositeTableType<User, TypeInsertUser, TypeUpdateUser>;
    [TableUserPinnedNote]: UserPinnedNote;
  }
}

declare module 'knex' {
  namespace Knex {
    interface QueryInterface {
      whereEqualLowercase<TRecord extends {}, TResult>(
        field: string,
        value: string,
      ): KnexOriginal.QueryBuilder<TRecord, TResult>;
    }
  }
}
