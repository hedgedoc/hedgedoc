/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Knex } from 'knex';

import { Alias, TypeInsertAlias, TypeUpdateAlias } from './alias';
import { ApiToken, TypeInsertApiToken, TypeUpdateApiToken } from './api-token';
import { Group, TypeInsertGroup, TypeUpdateGroup } from './group';
import { Identity, TypeInsertIdentity, TypeUpdateIdentity } from './identity';
import {
  AuthorshipInfo,
  GroupUser,
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
  UserPinnedNote,
} from './index';
import {
  MediaUpload,
  TypeInsertMediaUpload,
  TypeUpdateMediaUpload,
} from './media-upload';
import { Note, TypeInsertNote, TypeUpdateNote } from './note';
import {
  NoteGroupPermission,
  TypeUpdateNoteGroupPermission,
} from './note-group-permission';
import {
  NoteUserPermission,
  TypeUpdateNoteUserPermission,
} from './note-user-permission';
import { Revision, TypeInsertRevision } from './revision';
import { TypeInsertUser, TypeUpdateUser, User } from './user';

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
    [TableAuthorshipInfo]: AuthorshipInfo;
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
