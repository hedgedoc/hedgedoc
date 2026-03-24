/*
 * SPDX-FileCopyrightText: 2026 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FieldNameFolder, TableFolder, FieldNameNote, TableNote, TableUser, FieldNameUser } from '@hedgedoc/database';
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the folder table
  await knex.schema.createTable(TableFolder, (table) => {
    table.increments(FieldNameFolder.id).primary();
    table.string(FieldNameFolder.name, 255).notNullable();
    table
      .integer(FieldNameFolder.ownerId)
      .unsigned()
      .notNullable()
      .references(FieldNameUser.id)
      .inTable(TableUser)
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table
      .integer(FieldNameFolder.parentFolderId)
      .unsigned()
      .nullable()
      .references(FieldNameFolder.id)
      .inTable(TableFolder)
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.timestamp(FieldNameFolder.createdAt).notNullable();
  });

  // Add folder_id to note table
  await knex.schema.alterTable(TableNote, (table) => {
    table
      .integer(FieldNameNote.folderId)
      .unsigned()
      .nullable()
      .references(FieldNameFolder.id)
      .inTable(TableFolder)
      .onDelete('SET NULL') // If a folder is deleted, notes inside it are moved to root
      .onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove folder_id from note table
  await knex.schema.alterTable(TableNote, (table) => {
    table.dropColumn(FieldNameNote.folderId);
  });

  // Drop the folder table
  await knex.schema.dropTable(TableFolder);
}
