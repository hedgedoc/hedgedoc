/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
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
import { Knex } from 'knex';

/* eslint-disable @typescript-eslint/naming-convention */
declare module 'knex/types/tables.js' {
  interface Tables {
    [TableAlias]: Knex.CompositeTableType<Alias, Alias, TypeUpdateAlias>;
    [TableApiToken]: Knex.CompositeTableType<ApiToken>;
    [TableAuthorshipInfo]: Knex.CompositeTableType<AuthorshipInfo>;
    [TableGroup]: Knex.CompositeTableType<
      Group,
      TypeInsertGroup,
      TypeUpdateGroup
    >;
    [TableGroupUser]: GroupUser;
    [TableIdentity]: Knex.CompositeTableType<
      Identity,
      Identity,
      TypeUpdateIdentity
    >;
    [TableMediaUpload]: Knex.CompositeTableType<
      MediaUpload,
      MediaUpload,
      TypeUpdateMediaUpload
    >;
    [TableNote]: Knex.CompositeTableType<Note, TypeInsertNote, TypeUpdateNote>;
    [TableNoteGroupPermission]: Knex.CompositeTableType<
      NoteGroupPermission,
      NoteGroupPermission,
      TypeUpdateNoteGroupPermission
    >;
    [TableNoteUserPermission]: Knex.CompositeTableType<
      NoteUserPermission,
      NoteUserPermission,
      TypeUpdateNoteUserPermission
    >;
    [TableRevision]: Knex.CompositeTableType<Revision>;
    [TableRevisionTag]: RevisionTag;
    [TableUser]: Knex.CompositeTableType<User, TypeInsertUser, TypeUpdateUser>;
    [TableUserPinnedNote]: UserPinnedNote;
  }
}
