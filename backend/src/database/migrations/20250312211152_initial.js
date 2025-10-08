/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable */
const {
  AuthProviderType,
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
  MediaBackendType,
  NoteType,
  SpecialGroup,
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
} = require('@hedgedoc/database');

const up = async function (knex) {
  // Create the user table first as it's referenced by other tables
  await knex.schema.createTable(TableUser, (table) => {
    table.increments(FieldNameUser.id).primary();
    table.string(FieldNameUser.username).nullable().unique();
    table.string(FieldNameUser.displayName).notNullable();
    table.string(FieldNameUser.photoUrl).nullable();
    table.string(FieldNameUser.email).nullable();
    table.integer(FieldNameUser.authorStyle).notNullable();
    table.uuid(FieldNameUser.guestUuid).nullable().unique();
    table
      .timestamp(FieldNameUser.createdAt, { useTz: true })
      .defaultTo(knex.fn.now());
    table.index(FieldNameUser.username);
    table.index(FieldNameUser.guestUuid);
  });

  // Create group table
  await knex.schema.createTable(TableGroup, (table) => {
    table.increments(FieldNameGroup.id).primary();
    table.string(FieldNameGroup.name).notNullable();
    table.string(FieldNameGroup.displayName).notNullable();
    table.boolean(FieldNameGroup.isSpecial).notNullable().defaultTo(false);
    table.index(FieldNameGroup.name);
  });

  // Create special groups _EVERYONE and _LOGGED_IN
  await knex(TableGroup).insert([
    {
      [FieldNameGroup.name]: SpecialGroup.EVERYONE,
      [FieldNameGroup.displayName]: SpecialGroup.EVERYONE,
      [FieldNameGroup.isSpecial]: true,
    },
    {
      [FieldNameGroup.name]: SpecialGroup.LOGGED_IN,
      [FieldNameGroup.displayName]: SpecialGroup.LOGGED_IN,
      [FieldNameGroup.isSpecial]: true,
    },
  ]);

  // Create note table
  await knex.schema.createTable(TableNote, (table) => {
    table.increments(FieldNameNote.id).primary();
    table.integer(FieldNameNote.version).notNullable().defaultTo(2);
    table
      .timestamp(FieldNameNote.createdAt, { useTz: true })
      .defaultTo(knex.fn.now());
    table
      .integer(FieldNameNote.ownerId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser)
      .onDelete('CASCADE');
    table.index(FieldNameNote.ownerId);
  });

  // Create aliases table
  await knex.schema.createTable(TableAlias, (table) => {
    table.comment(
      'Stores aliases of notes, only on aliases per note can be is_primary == true, all other need to have is_primary == null ',
    );
    table.string(FieldNameAlias.alias).primary();
    table
      .integer(FieldNameAlias.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote)
      .onDelete('CASCADE');
    table.boolean(FieldNameAlias.isPrimary).nullable();
    table.unique([FieldNameAlias.noteId, FieldNameAlias.isPrimary], {
      indexName: 'only_one_note_can_be_primary',
      useConstraint: true,
    });
    table.index(FieldNameAlias.noteId);
  });

  // Create api_token table
  await knex.schema.createTable(TableApiToken, (table) => {
    table.string(FieldNameApiToken.id).primary();
    table
      .integer(FieldNameApiToken.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser)
      .onDelete('CASCADE');
    table.string(FieldNameApiToken.label).notNullable();
    table.string(FieldNameApiToken.secretHash).notNullable();
    table
      .timestamp(FieldNameApiToken.validUntil, { useTz: true })
      .notNullable();
    table.timestamp(FieldNameApiToken.lastUsedAt, { useTz: true }).nullable();
    table.timestamp(FieldNameApiToken.createdAt, { useTz: true }).notNullable();
    table.index(FieldNameApiToken.userId);
  });

  // Create identity table
  await knex.schema.createTable(TableIdentity, (table) => {
    table
      .integer(FieldNameIdentity.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser)
      .onDelete('CASCADE');
    table.enu(
      FieldNameIdentity.providerType,
      [AuthProviderType.LDAP, AuthProviderType.LOCAL, AuthProviderType.OIDC], // AuthProviderType.GUEST is not relevant for the DB
      {
        useNative: true,
        enumName: FieldNameIdentity.providerType,
      },
    );
    table.string(FieldNameIdentity.providerIdentifier).nullable();
    table.string(FieldNameIdentity.providerUserId).nullable();
    table.string(FieldNameIdentity.passwordHash).nullable();
    table
      .timestamp(FieldNameIdentity.createdAt, { useTz: true })
      .defaultTo(knex.fn.now());
    table
      .timestamp(FieldNameIdentity.updatedAt, { useTz: true })
      .defaultTo(knex.fn.now());
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
    table.index([
      FieldNameIdentity.providerUserId,
      FieldNameIdentity.providerType,
      FieldNameIdentity.providerIdentifier,
    ]);
  });

  // Create group_user join table
  await knex.schema.createTable(TableGroupUser, (table) => {
    table
      .integer(FieldNameGroupUser.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser)
      .onDelete('CASCADE');
    table
      .integer(FieldNameGroupUser.groupId)
      .unsigned()
      .notNullable()
      .references(FieldNameGroup.id)
      .inTable(TableGroup)
      .onDelete('CASCADE');
    table.primary([FieldNameGroupUser.userId, FieldNameGroupUser.groupId]);
    table.index(FieldNameGroupUser.userId);
    table.index(FieldNameGroupUser.groupId);
  });

  // Create revision table
  await knex.schema.createTable(TableRevision, (table) => {
    table.uuid(FieldNameRevision.uuid).primary();
    table
      .integer(FieldNameRevision.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote)
      .onDelete('CASCADE');
    table.text(FieldNameRevision.patch).notNullable();
    table.text(FieldNameRevision.content).notNullable();
    table.string(FieldNameRevision.title).notNullable();
    table.text(FieldNameRevision.description).notNullable();
    table.binary(FieldNameRevision.yjsStateVector).nullable();
    table.enu(FieldNameRevision.noteType, [NoteType.DOCUMENT, NoteType.SLIDE], {
      useNative: true,
      enumName: FieldNameRevision.noteType,
    });
    table
      .timestamp(FieldNameRevision.createdAt, { useTz: true })
      .defaultTo(knex.fn.now());
    table.index(FieldNameRevision.noteId);
  });

  // Create revision_tag table
  await knex.schema.createTable(TableRevisionTag, (table) => {
    table
      .uuid(FieldNameRevisionTag.revisionUuid)
      .unsigned()
      .notNullable()
      .references(FieldNameRevision.uuid)
      .inTable(TableRevision)
      .onDelete('CASCADE');
    table.string(FieldNameRevisionTag.tag).notNullable();
    table.primary([
      FieldNameRevisionTag.revisionUuid,
      FieldNameRevisionTag.tag,
    ]);
    table.index(FieldNameRevisionTag.revisionUuid);
  });

  // Create authorship_info table
  await knex.schema.createTable(TableAuthorshipInfo, (table) => {
    table
      .uuid(FieldNameAuthorshipInfo.revisionUuid)
      .unsigned()
      .notNullable()
      .references(FieldNameRevision.uuid)
      .inTable(TableRevision)
      .onDelete('CASCADE');
    table
      .integer(FieldNameAuthorshipInfo.authorId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser)
      .onDelete('CASCADE');
    table
      .integer(FieldNameAuthorshipInfo.startPosition)
      .unsigned()
      .notNullable();
    table.integer(FieldNameAuthorshipInfo.endPosition).unsigned().notNullable();
    table
      .timestamp(FieldNameAuthorshipInfo.createdAt, { useTz: true })
      .defaultTo(knex.fn.now());
    table.index(FieldNameAuthorshipInfo.revisionUuid);
    table.index(FieldNameAuthorshipInfo.authorId);
  });

  // Create note_user_permission table
  await knex.schema.createTable(TableNoteUserPermission, (table) => {
    table
      .integer(FieldNameNoteUserPermission.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote)
      .onDelete('CASCADE');
    table
      .integer(FieldNameNoteUserPermission.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser)
      .onDelete('CASCADE');
    table
      .boolean(FieldNameNoteUserPermission.canEdit)
      .notNullable()
      .defaultTo(false);
    table.primary([
      FieldNameNoteUserPermission.noteId,
      FieldNameNoteUserPermission.userId,
    ]);
    table.index(FieldNameNoteUserPermission.noteId);
    table.index(FieldNameNoteUserPermission.userId);
  });

  // Create note_group_permission table
  await knex.schema.createTable(TableNoteGroupPermission, (table) => {
    table
      .integer(FieldNameNoteGroupPermission.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote)
      .onDelete('CASCADE');
    table
      .integer(FieldNameNoteGroupPermission.groupId)
      .unsigned()
      .notNullable()
      .references(FieldNameGroup.id)
      .inTable(TableGroup)
      .onDelete('CASCADE');
    table
      .boolean(FieldNameNoteGroupPermission.canEdit)
      .notNullable()
      .defaultTo(false);
    table.primary([
      FieldNameNoteGroupPermission.noteId,
      FieldNameNoteGroupPermission.groupId,
    ]);
    table.index(FieldNameNoteGroupPermission.noteId);
    table.index(FieldNameNoteGroupPermission.groupId);
  });

  // Create media_upload table
  await knex.schema.createTable(TableMediaUpload, (table) => {
    table.uuid(FieldNameMediaUpload.uuid).primary();
    table
      .integer(FieldNameMediaUpload.noteId)
      .unsigned()
      .nullable()
      .references(FieldNameNote.id)
      .inTable(TableNote)
      .onDelete('SET NULL');
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
          MediaBackendType.AZURE,
          MediaBackendType.FILESYSTEM,
          MediaBackendType.IMGUR,
          MediaBackendType.S3,
          MediaBackendType.WEBDAV,
        ],
        {
          useNative: true,
          enumName: FieldNameMediaUpload.backendType,
        },
      )
      .notNullable();
    table.text(FieldNameMediaUpload.backendData).nullable();
    table
      .timestamp(FieldNameMediaUpload.createdAt, { useTz: true })
      .defaultTo(knex.fn.now());
    table.index(FieldNameMediaUpload.noteId);
    table.index(FieldNameMediaUpload.userId);
  });

  // Create user_pinned_note table
  await knex.schema.createTable(TableUserPinnedNote, (table) => {
    table
      .integer(FieldNameUserPinnedNote.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser)
      .onDelete('CASCADE');
    table
      .integer(FieldNameUserPinnedNote.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote)
      .onDelete('CASCADE');
    table.primary([
      FieldNameUserPinnedNote.userId,
      FieldNameUserPinnedNote.noteId,
    ]);
    table.index(FieldNameUserPinnedNote.userId);
    table.index(FieldNameUserPinnedNote.noteId);
  });
};

const down = async function (knex) {
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
};

module.exports = {
  up,
  down,
};
