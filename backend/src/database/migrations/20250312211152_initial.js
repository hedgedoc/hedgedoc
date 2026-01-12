/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* oxlint-disable */
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
  FieldNameVisitedNote,
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
  TableVisitedNote,
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
    table.timestamp(FieldNameUser.createdAt, { useTz: false, precision: 3 });
    table.index([FieldNameUser.username], 'idx_user_username');
    table.index([FieldNameUser.guestUuid], 'idx_user_guest_uuid');
  });

  // Create group table
  await knex.schema.createTable(TableGroup, (table) => {
    table.increments(FieldNameGroup.id).primary();
    table.string(FieldNameGroup.name).notNullable();
    table.string(FieldNameGroup.displayName).notNullable();
    table.boolean(FieldNameGroup.isSpecial).notNullable().defaultTo(false);
    table.index([FieldNameGroup.name], 'idx_group_name');
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
    table.timestamp(FieldNameNote.createdAt, { useTz: false, precision: 3 });
    table
      .integer(FieldNameNote.ownerId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser)
      .onDelete('CASCADE');
    table.boolean(FieldNameNote.publiclyVisible).notNullable();
    table.index([FieldNameNote.ownerId], 'idx_note_owner_id');
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
    table.index([FieldNameAlias.noteId], 'idx_alias_note_id');
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
    table.timestamp(FieldNameApiToken.validUntil, { useTz: false }).notNullable();
    table.timestamp(FieldNameApiToken.lastUsedAt, { useTz: false }).nullable();
    table.timestamp(FieldNameApiToken.createdAt, { useTz: false, precision: 3 }).notNullable();
    table.index([FieldNameApiToken.userId], 'idx_api_token_user_id');
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
    table.timestamp(FieldNameIdentity.createdAt, {
      useTz: false,
      precision: 3,
    });
    table.timestamp(FieldNameIdentity.updatedAt, {
      useTz: false,
      precision: 3,
    });
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
    table.index(
      [
        FieldNameIdentity.providerUserId,
        FieldNameIdentity.providerType,
        FieldNameIdentity.providerIdentifier,
      ],
      'idx_identity_provider_user',
    );
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
    table.index([FieldNameGroupUser.userId], 'idx_group_user_user_id');
    table.index([FieldNameGroupUser.groupId], 'idx_group_user_group_id');
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
    table.timestamp(FieldNameRevision.createdAt, {
      useTz: false,
      precision: 3,
    });
    table.index([FieldNameRevision.noteId], 'idx_revision_note_id');
  });

  // Create revision_tag table
  await knex.schema.createTable(TableRevisionTag, (table) => {
    table
      .uuid(FieldNameRevisionTag.revisionUuid)
      .notNullable()
      .references(FieldNameRevision.uuid)
      .inTable(TableRevision)
      .onDelete('CASCADE');
    table.string(FieldNameRevisionTag.tag).notNullable();
    table.primary([FieldNameRevisionTag.revisionUuid, FieldNameRevisionTag.tag]);
    table.index([FieldNameRevisionTag.revisionUuid], 'idx_revision_tag_revision_uuid');
  });

  // Create authorship_info table
  await knex.schema.createTable(TableAuthorshipInfo, (table) => {
    table
      .uuid(FieldNameAuthorshipInfo.revisionUuid)
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
    table.integer(FieldNameAuthorshipInfo.startPosition).unsigned().notNullable();
    table.integer(FieldNameAuthorshipInfo.endPosition).unsigned().notNullable();
    table.timestamp(FieldNameAuthorshipInfo.createdAt, {
      useTz: false,
      precision: 3,
    });
    table.index([FieldNameAuthorshipInfo.revisionUuid], 'idx_authorship_info_revision_uuid');
    table.index([FieldNameAuthorshipInfo.authorId], 'idx_authorship_info_author_id');
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
    table.boolean(FieldNameNoteUserPermission.canEdit).notNullable().defaultTo(false);
    table.primary([FieldNameNoteUserPermission.noteId, FieldNameNoteUserPermission.userId]);
    table.index([FieldNameNoteUserPermission.noteId], 'idx_note_user_permission_note_id');
    table.index([FieldNameNoteUserPermission.userId], 'idx_note_user_permission_user_id');
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
    table.boolean(FieldNameNoteGroupPermission.canEdit).notNullable().defaultTo(false);
    table.primary([FieldNameNoteGroupPermission.noteId, FieldNameNoteGroupPermission.groupId]);
    table.index([FieldNameNoteGroupPermission.noteId], 'idx_note_group_permission_note_id');
    table.index([FieldNameNoteGroupPermission.groupId], 'idx_note_group_permission_group_id');
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
    table.timestamp(FieldNameMediaUpload.createdAt, {
      useTz: false,
      precision: 3,
    });
    table.index([FieldNameMediaUpload.noteId], 'idx_media_upload_note_id');
    table.index([FieldNameMediaUpload.userId], 'idx_media_upload_user_id');
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
    table.primary([FieldNameUserPinnedNote.userId, FieldNameUserPinnedNote.noteId]);
    table.index([FieldNameUserPinnedNote.userId], 'idx_user_pinned_note_user_id');
    table.index([FieldNameUserPinnedNote.noteId], 'idx_user_pinned_note_note_id');
  });

  // Create visited_notes table
  await knex.schema.createTable(TableVisitedNote, (table) => {
    table
      .integer(FieldNameVisitedNote.userId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser)
      .onDelete('CASCADE');
    table
      .integer(FieldNameVisitedNote.noteId)
      .unsigned()
      .notNullable()
      .references(FieldNameNote.id)
      .inTable(TableNote)
      .onDelete('CASCADE');
    table.timestamp(FieldNameVisitedNote.visitedAt, {
      useTz: false,
      precision: 3,
    });

    table.primary([FieldNameVisitedNote.userId, FieldNameVisitedNote.noteId]);
    table.index([FieldNameVisitedNote.userId], 'idx_visited_notes_user_id');
    table.index([FieldNameVisitedNote.noteId], 'idx_visited_notes_note_id');
  });
};

const down = async function (knex) {
  // Drop tables in reverse order of creation to avoid integer key constraints
  await knex.schema.dropTableIfExists(TableVisitedNote);
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
