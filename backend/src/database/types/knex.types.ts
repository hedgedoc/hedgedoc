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
  TypeInsertAlias,
  TypeInsertApiToken,
  TypeInsertAuthorshipInfo,
  TypeInsertGroup,
  TypeInsertIdentity,
  TypeInsertMediaUpload,
  TypeInsertNote,
  TypeInsertRevision,
  TypeInsertUser,
  TypeUpdateAlias,
  TypeUpdateApiToken,
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
    [TableAlias]: Knex.CompositeTableType<
      Alias,
      TypeInsertAlias,
      TypeUpdateAlias
    >;
    [TableApiToken]: Knex.CompositeTableType<
      ApiToken,
      TypeInsertApiToken,
      TypeUpdateApiToken
    >;
    [TableAuthorshipInfo]: Knex.CompositeTableType<
      AuthorshipInfo,
      TypeInsertAuthorshipInfo
    >;
    [TableGroup]: Knex.CompositeTableType<
      Group,
      TypeInsertGroup,
      TypeUpdateGroup
    >;
    [TableGroupUser]: GroupUser;
    [TableIdentity]: Knex.CompositeTableType<
      Identity,
      TypeInsertIdentity,
      TypeUpdateIdentity
    >;
    [TableMediaUpload]: Knex.CompositeTableType<
      MediaUpload,
      TypeInsertMediaUpload,
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
    [TableRevision]: Knex.CompositeTableType<Revision, TypeInsertRevision>;
    [TableRevisionTag]: RevisionTag;
    [TableUser]: Knex.CompositeTableType<User, TypeInsertUser, TypeUpdateUser>;
    [TableUserPinnedNote]: UserPinnedNote;
  }
}
