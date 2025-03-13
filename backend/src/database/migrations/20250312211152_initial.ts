/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { NoteType } from '@hedgedoc/commons';
import type { Knex } from 'knex';

import { ProviderType } from '../../auth/provider-type.enum';
import { SpecialGroup } from '../../groups/groups.special';
import { BackendType } from '../../media/backends/backend-type.enum';
import {
  FieldNameAlias,
  FieldNameApiToken,
  FieldNameAuthorshipInfo,
  FieldNameGroup,
  FieldNameGroupUser,
  FieldNameIdentity,
  FieldNameMediaUpload,
  FieldNameNote,
  FieldNameNoteGroupPermission,
  FieldNameNoteUserPermission,
  FieldNameRevision,
  FieldNameRevisionTag,
  FieldNameUser,
  FieldNameUserPinnedNote,
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
} from '../types';

export async function up(knex: Knex): Promise<void> {
  // Create user table first as it's referenced by other tables
  await knex.schema.createTable(TableUser, (table) => {
    table.increments(FieldNameUser.id).primary();
    table.string(FieldNameUser.username).nullable().unique();
    table.string(FieldNameUser.displayName).nullable();
    table.string(FieldNameUser.photoUrl).nullable();
    table.string(FieldNameUser.email).nullable();
    table.integer(FieldNameUser.authorStyle).notNullable();
    table.uuid(FieldNameUser.guestUuid).nullable().unique();
    table.timestamp(FieldNameUser.createdAt).defaultTo(knex.fn.now());
  });

  // Create group table
  await knex.schema.createTable(TableGroup, (table) => {
    table.increments(FieldNameGroup.id).primary();
    table.string(FieldNameGroup.name).notNullable();
    table.string(FieldNameGroup.displayName).notNullable();
    table.boolean(FieldNameGroup.isSpecial).notNullable().defaultTo(false);
  });

  // Create special groups _EVERYONE and _LOGGED_IN
  await knex(TableGroup).insert([
    {
      name: SpecialGroup.EVERYONE,
      display_name: SpecialGroup.EVERYONE,
      is_special: true,
    },
    {
      name: SpecialGroup.LOGGED_IN,
      display_name: SpecialGroup.EVERYONE,
      is_special: true,
    },
  ]);

  // Create note table
  await knex.schema.createTable(TableNote, (table) => {
    table.increments(FieldNameNote.id).primary();
    table.integer(FieldNameNote.version).notNullable().defaultTo(2);
    table.timestamp(FieldNameNote.createdAt).defaultTo(knex.fn.now());
    table
      .integer(FieldNameNote.ownerId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser);
  });

  // Create alias table
  await knex.schema.createTable(TableAlias, (table) => {
    table.comment(
      'Stores aliases of notes, only on alias per note can be is_primary == true, all other need to have is_primary == null ',
    );
    table.string(FieldNameAlias.alias).primary();
    table
      .integer(FieldNameAlias.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote);
    table.boolean(FieldNameAlias.isPrimary).nullable();
    table.unique([FieldNameAlias.noteId, FieldNameAlias.isPrimary], {
      indexName: 'only_one_note_can_be_primary',
      useConstraint: true,
    });
  });

  // Create api_token table
  await knex.schema.createTable(TableApiToken, (table) => {
    table.string(FieldNameApiToken.id).primary();
    table
      .integer(FieldNameApiToken.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser);
    table.string(FieldNameApiToken.label).notNullable();
    table.string(FieldNameApiToken.secretHash).notNullable();
    table.timestamp(FieldNameApiToken.validUntil).notNullable();
    table.timestamp(FieldNameApiToken.lastUsedAt).nullable();
  });

  // Create identity table
  await knex.schema.createTable(TableIdentity, (table) => {
    table
      .integer(FieldNameIdentity.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser);
    table.enu(
      FieldNameIdentity.providerType,
      [ProviderType.LDAP, ProviderType.LOCAL, ProviderType.OIDC], // ProviderType.GUEST is not relevant for the DB
      {
        useNative: true,
        enumName: FieldNameIdentity.providerType,
      },
    );
    table.string(FieldNameIdentity.providerIdentifier).nullable();
    table.string(FieldNameIdentity.providerUserId).nullable();
    table.string(FieldNameIdentity.passwordHash).nullable();
    table.timestamp(FieldNameIdentity.createdAt).defaultTo(knex.fn.now());
    table.timestamp(FieldNameIdentity.updatedAt).defaultTo(knex.fn.now());
    table.unique(
      [
        FieldNameIdentity.userId,
        FieldNameIdentity.providerType,
        FieldNameIdentity.providerIdentifier,
      ],
      {
        indexName: 'each_user_has_only_one_account_per_provider',
        useConstraint: true,
      },
    );
  });

  // Create group_user join table
  await knex.schema.createTable(TableGroupUser, (table) => {
    table
      .integer(FieldNameGroupUser.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser);
    table
      .integer(FieldNameGroupUser.groupId)
      .unsigned()
      .notNullable()
      .references(FieldNameGroup.id)
      .inTable(TableGroup);
    table.primary([FieldNameGroupUser.userId, FieldNameGroupUser.groupId]);
  });

  // Create revision table
  await knex.schema.createTable(TableRevision, (table) => {
    table.increments(FieldNameRevision.id).primary();
    table
      .integer(FieldNameRevision.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote);
    table.text(FieldNameRevision.patch).notNullable();
    table.text(FieldNameRevision.content).notNullable();
    table.string(FieldNameRevision.title).notNullable();
    table.text(FieldNameRevision.description).notNullable();
    table.binary(FieldNameRevision.yjsStateVector).nullable();
    table.enu(FieldNameRevision.noteType, [NoteType.DOCUMENT, NoteType.SLIDE], {
      useNative: true,
      enumName: FieldNameRevision.noteType,
    });
    table.timestamp(FieldNameRevision.createdAt).defaultTo(knex.fn.now());
  });

  // Create revision_tag table
  await knex.schema.createTable(TableRevisionTag, (table) => {
    table
      .integer(FieldNameRevisionTag.revisionId)
      .unsigned()
      .notNullable()
      .references(FieldNameRevision.id)
      .inTable(TableRevision);
    table.string(FieldNameRevisionTag.tag).notNullable();
    table.primary([FieldNameRevisionTag.revisionId, FieldNameRevisionTag.tag]);
  });

  // Create authorship_info table
  await knex.schema.createTable(TableAuthorshipInfo, (table) => {
    table
      .integer(FieldNameAuthorshipInfo.revisionId)
      .unsigned()
      .notNullable()
      .references(FieldNameRevision.id)
      .inTable(TableRevision);
    table
      .integer(FieldNameAuthorshipInfo.authorId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser);
    table
      .integer(FieldNameAuthorshipInfo.startPosition)
      .unsigned()
      .notNullable();
    table.integer(FieldNameAuthorshipInfo.endPosition).unsigned().notNullable();
  });

  // Create note_user_permission table
  await knex.schema.createTable(TableNoteUserPermission, (table) => {
    table
      .integer(FieldNameNoteUserPermission.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote);
    table
      .integer(FieldNameNoteUserPermission.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser);
    table
      .boolean(FieldNameNoteUserPermission.canEdit)
      .notNullable()
      .defaultTo(false);
    table.primary([
      FieldNameNoteUserPermission.noteId,
      FieldNameNoteUserPermission.userId,
    ]);
  });

  // Create note_group_permission table
  await knex.schema.createTable(TableNoteGroupPermission, (table) => {
    table
      .integer(FieldNameNoteGroupPermission.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote);
    table
      .integer(FieldNameNoteGroupPermission.groupId)
      .unsigned()
      .notNullable()
      .references(FieldNameGroup.id)
      .inTable(TableGroup);
    table
      .boolean(FieldNameNoteGroupPermission.canEdit)
      .notNullable()
      .defaultTo(false);
    table.primary([
      FieldNameNoteGroupPermission.noteId,
      FieldNameNoteGroupPermission.groupId,
    ]);
  });

  // Create media_upload table
  await knex.schema.createTable(TableMediaUpload, (table) => {
    table.uuid(FieldNameMediaUpload.uuid).primary();
    table
      .integer(FieldNameMediaUpload.noteId)
      .unsigned()
      .nullable()
      .references(FieldNameNote.id)
      .inTable(TableNote);
    table
      .integer(FieldNameMediaUpload.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser);
    table.string(FieldNameMediaUpload.fileName).notNullable();
    table
      .enu(
        FieldNameMediaUpload.backendType,
        [
          BackendType.AZURE,
          BackendType.FILESYSTEM,
          BackendType.IMGUR,
          BackendType.S3,
          BackendType.WEBDAV,
        ],
        {
          useNative: true,
          enumName: FieldNameMediaUpload.backendType,
        },
      )
      .notNullable();
    table.text(FieldNameMediaUpload.backendData).nullable();
    table.timestamp(FieldNameMediaUpload.createdAt).defaultTo(knex.fn.now());
  });

  // Create user_pinned_note table
  await knex.schema.createTable(TableUserPinnedNote, (table) => {
    table
      .integer(FieldNameUserPinnedNote.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser);
    table
      .integer(FieldNameUserPinnedNote.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote);
    table.primary([
      FieldNameUserPinnedNote.userId,
      FieldNameUserPinnedNote.noteId,
    ]);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order of creation to avoid integer key constraints
  await knex.schema.dropTableIfExists(TableUserPinnedNote);
  await knex.schema.dropTableIfExists(TableMediaUpload);
  await knex.schema.dropTableIfExists(TableNoteGroupPermission);
  await knex.schema.dropTableIfExists(TableNoteUserPermission);
  await knex.schema.dropTableIfExists(TableAuthorshipInfo);
  await knex.schema.dropTableIfExists(TableRevisionTag);
  await knex.schema.dropTableIfExists(TableRevision);
  await knex.schema.dropTableIfExists(TableGroupUser);
  await knex.schema.dropTableIfExists(TableIdentity);
  await knex.schema.dropTableIfExists(TableApiToken);
  await knex.schema.dropTableIfExists(TableApiToken);
  await knex.schema.dropTableIfExists(TableNote);
  await knex.schema.dropTableIfExists(TableGroup);
  await knex.schema.dropTableIfExists(TableUser);
}
