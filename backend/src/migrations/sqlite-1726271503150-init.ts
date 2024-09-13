/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1726271503150 implements MigrationInterface {
  name = 'Init1726271503150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "api_token" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "keyId" varchar NOT NULL, "label" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "hash" varchar NOT NULL, "validUntil" datetime NOT NULL, "lastUsedAt" date, "userId" integer, CONSTRAINT "UQ_3e254e2eb542a65da7c405d0683" UNIQUE ("keyId"), CONSTRAINT "UQ_60221392192b32c7560c128a6fa" UNIQUE ("hash"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "history_entry" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "pinStatus" boolean NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "noteId" integer)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_928dd947355b0837366470a916" ON "history_entry" ("noteId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "media_upload" ("uuid" varchar PRIMARY KEY NOT NULL, "fileName" varchar NOT NULL, "backendType" varchar NOT NULL, "backendData" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "noteId" integer, "userId" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "group" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "displayName" varchar NOT NULL, "special" boolean NOT NULL, CONSTRAINT "UQ_8a45300fd825918f3b40195fbdc" UNIQUE ("name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "note_group_permission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "canEdit" boolean NOT NULL, "groupId" integer, "noteId" integer)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ee1744842a9ef3ffbc05a7016a" ON "note_group_permission" ("groupId", "noteId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "note_user_permission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "canEdit" boolean NOT NULL, "userId" integer, "noteId" integer)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5a3e91233d8878f98f5ad86b71" ON "note_user_permission" ("userId", "noteId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "alias" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "primary" boolean, "noteId" integer, CONSTRAINT "UQ_89f27e45cc5c1e43abd9132c9b9" UNIQUE ("name"), CONSTRAINT "Only one primary alias per note" UNIQUE ("noteId", "primary"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "note" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "publicId" text NOT NULL, "viewCount" integer NOT NULL DEFAULT (0), "version" integer NOT NULL DEFAULT (2), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "ownerId" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL)`,
    );
    await queryRunner.query(
      `CREATE TABLE "revision" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "patch" text NOT NULL, "title" text NOT NULL, "description" text NOT NULL, "content" text NOT NULL, "length" integer NOT NULL, "yjsStateVector" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "noteId" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "edit" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "startPos" integer NOT NULL, "endPos" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" varchar(255) PRIMARY KEY NOT NULL, "expiredAt" bigint NOT NULL, "json" text NOT NULL, "destroyedAt" datetime, "authorId" integer)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "author" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "color" integer NOT NULL, "userId" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "displayName" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "photo" text, "email" text, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "identity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "providerType" varchar NOT NULL, "providerIdentifier" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "providerUserId" text, "passwordHash" text, "userId" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_members_user" ("groupId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("groupId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfa303089d367a2e3c02b002b8" ON "group_members_user" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_427107c650638bcb2f1e167d2e" ON "group_members_user" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "revision_tags_tag" ("revisionId" integer NOT NULL, "tagId" integer NOT NULL, PRIMARY KEY ("revisionId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3382f45eefeb40f91e45cfd418" ON "revision_tags_tag" ("revisionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_19dbafe2a8b456c0ef40858d49" ON "revision_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "revision_edits_edit" ("revisionId" integer NOT NULL, "editId" integer NOT NULL, PRIMARY KEY ("revisionId", "editId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52c6a61e1a646768391c7854fe" ON "revision_edits_edit" ("revisionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_470886feb50e30114e39c42698" ON "revision_edits_edit" ("editId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_api_token" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "keyId" varchar NOT NULL, "label" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "hash" varchar NOT NULL, "validUntil" datetime NOT NULL, "lastUsedAt" date, "userId" integer, CONSTRAINT "UQ_3e254e2eb542a65da7c405d0683" UNIQUE ("keyId"), CONSTRAINT "UQ_60221392192b32c7560c128a6fa" UNIQUE ("hash"), CONSTRAINT "FK_cbfc4e2b85b78207afb0b2d7fbc" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_api_token"("id", "keyId", "label", "createdAt", "hash", "validUntil", "lastUsedAt", "userId") SELECT "id", "keyId", "label", "createdAt", "hash", "validUntil", "lastUsedAt", "userId" FROM "api_token"`,
    );
    await queryRunner.query(`DROP TABLE "api_token"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_api_token" RENAME TO "api_token"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_928dd947355b0837366470a916"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_history_entry" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "pinStatus" boolean NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "noteId" integer, CONSTRAINT "FK_42b8ae461cb58747a24340e6c64" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_8f3595373fc9f6a32f126270422" FOREIGN KEY ("noteId") REFERENCES "note" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_history_entry"("id", "pinStatus", "updatedAt", "userId", "noteId") SELECT "id", "pinStatus", "updatedAt", "userId", "noteId" FROM "history_entry"`,
    );
    await queryRunner.query(`DROP TABLE "history_entry"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_history_entry" RENAME TO "history_entry"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_928dd947355b0837366470a916" ON "history_entry" ("noteId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_media_upload" ("uuid" varchar PRIMARY KEY NOT NULL, "fileName" varchar NOT NULL, "backendType" varchar NOT NULL, "backendData" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "noteId" integer, "userId" integer, CONSTRAINT "FK_edba6d4e0f3bcf6605772f0af6b" FOREIGN KEY ("noteId") REFERENCES "note" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_73ce66b082df1df2003e305e9ac" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_media_upload"("uuid", "fileName", "backendType", "backendData", "createdAt", "noteId", "userId") SELECT "uuid", "fileName", "backendType", "backendData", "createdAt", "noteId", "userId" FROM "media_upload"`,
    );
    await queryRunner.query(`DROP TABLE "media_upload"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_media_upload" RENAME TO "media_upload"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_ee1744842a9ef3ffbc05a7016a"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_note_group_permission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "canEdit" boolean NOT NULL, "groupId" integer, "noteId" integer, CONSTRAINT "FK_743ea3d9e0e26d7cbb9c174e56b" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_fd5c9329d8b45cb160676f8d8c1" FOREIGN KEY ("noteId") REFERENCES "note" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_note_group_permission"("id", "canEdit", "groupId", "noteId") SELECT "id", "canEdit", "groupId", "noteId" FROM "note_group_permission"`,
    );
    await queryRunner.query(`DROP TABLE "note_group_permission"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_note_group_permission" RENAME TO "note_group_permission"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ee1744842a9ef3ffbc05a7016a" ON "note_group_permission" ("groupId", "noteId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_5a3e91233d8878f98f5ad86b71"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_note_user_permission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "canEdit" boolean NOT NULL, "userId" integer, "noteId" integer, CONSTRAINT "FK_03cea81e07bab8864de026d517d" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_bc1ca3a87a9d662350d281a7f16" FOREIGN KEY ("noteId") REFERENCES "note" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_note_user_permission"("id", "canEdit", "userId", "noteId") SELECT "id", "canEdit", "userId", "noteId" FROM "note_user_permission"`,
    );
    await queryRunner.query(`DROP TABLE "note_user_permission"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_note_user_permission" RENAME TO "note_user_permission"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5a3e91233d8878f98f5ad86b71" ON "note_user_permission" ("userId", "noteId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_alias" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "primary" boolean, "noteId" integer, CONSTRAINT "UQ_89f27e45cc5c1e43abd9132c9b9" UNIQUE ("name"), CONSTRAINT "Only one primary alias per note" UNIQUE ("noteId", "primary"), CONSTRAINT "FK_63012a303e6ca53144a8b7b64b0" FOREIGN KEY ("noteId") REFERENCES "note" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_alias"("id", "name", "primary", "noteId") SELECT "id", "name", "primary", "noteId" FROM "alias"`,
    );
    await queryRunner.query(`DROP TABLE "alias"`);
    await queryRunner.query(`ALTER TABLE "temporary_alias" RENAME TO "alias"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_note" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "publicId" text NOT NULL, "viewCount" integer NOT NULL DEFAULT (0), "version" integer NOT NULL DEFAULT (2), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "ownerId" integer, CONSTRAINT "FK_b09836eba01a8653c0628a78af8" FOREIGN KEY ("ownerId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_note"("id", "publicId", "viewCount", "version", "createdAt", "ownerId") SELECT "id", "publicId", "viewCount", "version", "createdAt", "ownerId" FROM "note"`,
    );
    await queryRunner.query(`DROP TABLE "note"`);
    await queryRunner.query(`ALTER TABLE "temporary_note" RENAME TO "note"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_revision" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "patch" text NOT NULL, "title" text NOT NULL, "description" text NOT NULL, "content" text NOT NULL, "length" integer NOT NULL, "yjsStateVector" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "noteId" integer, CONSTRAINT "FK_8ac498c7c70de43d01b94fe7905" FOREIGN KEY ("noteId") REFERENCES "note" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_revision"("id", "patch", "title", "description", "content", "length", "yjsStateVector", "createdAt", "noteId") SELECT "id", "patch", "title", "description", "content", "length", "yjsStateVector", "createdAt", "noteId" FROM "revision"`,
    );
    await queryRunner.query(`DROP TABLE "revision"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_revision" RENAME TO "revision"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_edit" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "startPos" integer NOT NULL, "endPos" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer, CONSTRAINT "FK_bbab22ed1a0e243b28623f4f48a" FOREIGN KEY ("authorId") REFERENCES "author" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_edit"("id", "startPos", "endPos", "createdAt", "updatedAt", "authorId") SELECT "id", "startPos", "endPos", "createdAt", "updatedAt", "authorId" FROM "edit"`,
    );
    await queryRunner.query(`DROP TABLE "edit"`);
    await queryRunner.query(`ALTER TABLE "temporary_edit" RENAME TO "edit"`);
    await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_session" ("id" varchar(255) PRIMARY KEY NOT NULL, "expiredAt" bigint NOT NULL, "json" text NOT NULL, "destroyedAt" datetime, "authorId" integer, CONSTRAINT "FK_e5da4837ed9d236532b3215a84e" FOREIGN KEY ("authorId") REFERENCES "author" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_session"("id", "expiredAt", "json", "destroyedAt", "authorId") SELECT "id", "expiredAt", "json", "destroyedAt", "authorId" FROM "session"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_session" RENAME TO "session"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_author" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "color" integer NOT NULL, "userId" integer, CONSTRAINT "FK_645811deaaaa772f9e6c2a4b927" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_author"("id", "color", "userId") SELECT "id", "color", "userId" FROM "author"`,
    );
    await queryRunner.query(`DROP TABLE "author"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_author" RENAME TO "author"`,
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_identity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "providerType" varchar NOT NULL, "providerIdentifier" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "providerUserId" text, "passwordHash" text, "userId" integer, CONSTRAINT "FK_12915039d2868ab654567bf5181" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_identity"("id", "providerType", "providerIdentifier", "createdAt", "updatedAt", "providerUserId", "passwordHash", "userId") SELECT "id", "providerType", "providerIdentifier", "createdAt", "updatedAt", "providerUserId", "passwordHash", "userId" FROM "identity"`,
    );
    await queryRunner.query(`DROP TABLE "identity"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_identity" RENAME TO "identity"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_bfa303089d367a2e3c02b002b8"`);
    await queryRunner.query(`DROP INDEX "IDX_427107c650638bcb2f1e167d2e"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_group_members_user" ("groupId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "FK_bfa303089d367a2e3c02b002b8f" FOREIGN KEY ("groupId") REFERENCES "group" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_427107c650638bcb2f1e167d2e5" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("groupId", "userId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_group_members_user"("groupId", "userId") SELECT "groupId", "userId" FROM "group_members_user"`,
    );
    await queryRunner.query(`DROP TABLE "group_members_user"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_group_members_user" RENAME TO "group_members_user"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfa303089d367a2e3c02b002b8" ON "group_members_user" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_427107c650638bcb2f1e167d2e" ON "group_members_user" ("userId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_3382f45eefeb40f91e45cfd418"`);
    await queryRunner.query(`DROP INDEX "IDX_19dbafe2a8b456c0ef40858d49"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_revision_tags_tag" ("revisionId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "FK_3382f45eefeb40f91e45cfd4180" FOREIGN KEY ("revisionId") REFERENCES "revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_19dbafe2a8b456c0ef40858d49f" FOREIGN KEY ("tagId") REFERENCES "tag" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("revisionId", "tagId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_revision_tags_tag"("revisionId", "tagId") SELECT "revisionId", "tagId" FROM "revision_tags_tag"`,
    );
    await queryRunner.query(`DROP TABLE "revision_tags_tag"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_revision_tags_tag" RENAME TO "revision_tags_tag"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3382f45eefeb40f91e45cfd418" ON "revision_tags_tag" ("revisionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_19dbafe2a8b456c0ef40858d49" ON "revision_tags_tag" ("tagId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_52c6a61e1a646768391c7854fe"`);
    await queryRunner.query(`DROP INDEX "IDX_470886feb50e30114e39c42698"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_revision_edits_edit" ("revisionId" integer NOT NULL, "editId" integer NOT NULL, CONSTRAINT "FK_52c6a61e1a646768391c7854feb" FOREIGN KEY ("revisionId") REFERENCES "revision" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "FK_470886feb50e30114e39c426987" FOREIGN KEY ("editId") REFERENCES "edit" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, PRIMARY KEY ("revisionId", "editId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_revision_edits_edit"("revisionId", "editId") SELECT "revisionId", "editId" FROM "revision_edits_edit"`,
    );
    await queryRunner.query(`DROP TABLE "revision_edits_edit"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_revision_edits_edit" RENAME TO "revision_edits_edit"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52c6a61e1a646768391c7854fe" ON "revision_edits_edit" ("revisionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_470886feb50e30114e39c42698" ON "revision_edits_edit" ("editId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_470886feb50e30114e39c42698"`);
    await queryRunner.query(`DROP INDEX "IDX_52c6a61e1a646768391c7854fe"`);
    await queryRunner.query(
      `ALTER TABLE "revision_edits_edit" RENAME TO "temporary_revision_edits_edit"`,
    );
    await queryRunner.query(
      `CREATE TABLE "revision_edits_edit" ("revisionId" integer NOT NULL, "editId" integer NOT NULL, PRIMARY KEY ("revisionId", "editId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "revision_edits_edit"("revisionId", "editId") SELECT "revisionId", "editId" FROM "temporary_revision_edits_edit"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_revision_edits_edit"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_470886feb50e30114e39c42698" ON "revision_edits_edit" ("editId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52c6a61e1a646768391c7854fe" ON "revision_edits_edit" ("revisionId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_19dbafe2a8b456c0ef40858d49"`);
    await queryRunner.query(`DROP INDEX "IDX_3382f45eefeb40f91e45cfd418"`);
    await queryRunner.query(
      `ALTER TABLE "revision_tags_tag" RENAME TO "temporary_revision_tags_tag"`,
    );
    await queryRunner.query(
      `CREATE TABLE "revision_tags_tag" ("revisionId" integer NOT NULL, "tagId" integer NOT NULL, PRIMARY KEY ("revisionId", "tagId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "revision_tags_tag"("revisionId", "tagId") SELECT "revisionId", "tagId" FROM "temporary_revision_tags_tag"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_revision_tags_tag"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_19dbafe2a8b456c0ef40858d49" ON "revision_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3382f45eefeb40f91e45cfd418" ON "revision_tags_tag" ("revisionId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_427107c650638bcb2f1e167d2e"`);
    await queryRunner.query(`DROP INDEX "IDX_bfa303089d367a2e3c02b002b8"`);
    await queryRunner.query(
      `ALTER TABLE "group_members_user" RENAME TO "temporary_group_members_user"`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_members_user" ("groupId" integer NOT NULL, "userId" integer NOT NULL, PRIMARY KEY ("groupId", "userId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "group_members_user"("groupId", "userId") SELECT "groupId", "userId" FROM "temporary_group_members_user"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_group_members_user"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_427107c650638bcb2f1e167d2e" ON "group_members_user" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfa303089d367a2e3c02b002b8" ON "group_members_user" ("groupId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "identity" RENAME TO "temporary_identity"`,
    );
    await queryRunner.query(
      `CREATE TABLE "identity" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "providerType" varchar NOT NULL, "providerIdentifier" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "providerUserId" text, "passwordHash" text, "userId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "identity"("id", "providerType", "providerIdentifier", "createdAt", "updatedAt", "providerUserId", "passwordHash", "userId") SELECT "id", "providerType", "providerIdentifier", "createdAt", "updatedAt", "providerUserId", "passwordHash", "userId" FROM "temporary_identity"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_identity"`);
    await queryRunner.query(
      `ALTER TABLE "author" RENAME TO "temporary_author"`,
    );
    await queryRunner.query(
      `CREATE TABLE "author" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "color" integer NOT NULL, "userId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "author"("id", "color", "userId") SELECT "id", "color", "userId" FROM "temporary_author"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_author"`);
    await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
    await queryRunner.query(
      `ALTER TABLE "session" RENAME TO "temporary_session"`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" varchar(255) PRIMARY KEY NOT NULL, "expiredAt" bigint NOT NULL, "json" text NOT NULL, "destroyedAt" datetime, "authorId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "session"("id", "expiredAt", "json", "destroyedAt", "authorId") SELECT "id", "expiredAt", "json", "destroyedAt", "authorId" FROM "temporary_session"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_session"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `,
    );
    await queryRunner.query(`ALTER TABLE "edit" RENAME TO "temporary_edit"`);
    await queryRunner.query(
      `CREATE TABLE "edit" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "startPos" integer NOT NULL, "endPos" integer NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "authorId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "edit"("id", "startPos", "endPos", "createdAt", "updatedAt", "authorId") SELECT "id", "startPos", "endPos", "createdAt", "updatedAt", "authorId" FROM "temporary_edit"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_edit"`);
    await queryRunner.query(
      `ALTER TABLE "revision" RENAME TO "temporary_revision"`,
    );
    await queryRunner.query(
      `CREATE TABLE "revision" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "patch" text NOT NULL, "title" text NOT NULL, "description" text NOT NULL, "content" text NOT NULL, "length" integer NOT NULL, "yjsStateVector" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "noteId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "revision"("id", "patch", "title", "description", "content", "length", "yjsStateVector", "createdAt", "noteId") SELECT "id", "patch", "title", "description", "content", "length", "yjsStateVector", "createdAt", "noteId" FROM "temporary_revision"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_revision"`);
    await queryRunner.query(`ALTER TABLE "note" RENAME TO "temporary_note"`);
    await queryRunner.query(
      `CREATE TABLE "note" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "publicId" text NOT NULL, "viewCount" integer NOT NULL DEFAULT (0), "version" integer NOT NULL DEFAULT (2), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "ownerId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "note"("id", "publicId", "viewCount", "version", "createdAt", "ownerId") SELECT "id", "publicId", "viewCount", "version", "createdAt", "ownerId" FROM "temporary_note"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_note"`);
    await queryRunner.query(`ALTER TABLE "alias" RENAME TO "temporary_alias"`);
    await queryRunner.query(
      `CREATE TABLE "alias" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "primary" boolean, "noteId" integer, CONSTRAINT "UQ_89f27e45cc5c1e43abd9132c9b9" UNIQUE ("name"), CONSTRAINT "Only one primary alias per note" UNIQUE ("noteId", "primary"))`,
    );
    await queryRunner.query(
      `INSERT INTO "alias"("id", "name", "primary", "noteId") SELECT "id", "name", "primary", "noteId" FROM "temporary_alias"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_alias"`);
    await queryRunner.query(`DROP INDEX "IDX_5a3e91233d8878f98f5ad86b71"`);
    await queryRunner.query(
      `ALTER TABLE "note_user_permission" RENAME TO "temporary_note_user_permission"`,
    );
    await queryRunner.query(
      `CREATE TABLE "note_user_permission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "canEdit" boolean NOT NULL, "userId" integer, "noteId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "note_user_permission"("id", "canEdit", "userId", "noteId") SELECT "id", "canEdit", "userId", "noteId" FROM "temporary_note_user_permission"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_note_user_permission"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5a3e91233d8878f98f5ad86b71" ON "note_user_permission" ("userId", "noteId") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_ee1744842a9ef3ffbc05a7016a"`);
    await queryRunner.query(
      `ALTER TABLE "note_group_permission" RENAME TO "temporary_note_group_permission"`,
    );
    await queryRunner.query(
      `CREATE TABLE "note_group_permission" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "canEdit" boolean NOT NULL, "groupId" integer, "noteId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "note_group_permission"("id", "canEdit", "groupId", "noteId") SELECT "id", "canEdit", "groupId", "noteId" FROM "temporary_note_group_permission"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_note_group_permission"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ee1744842a9ef3ffbc05a7016a" ON "note_group_permission" ("groupId", "noteId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "media_upload" RENAME TO "temporary_media_upload"`,
    );
    await queryRunner.query(
      `CREATE TABLE "media_upload" ("uuid" varchar PRIMARY KEY NOT NULL, "fileName" varchar NOT NULL, "backendType" varchar NOT NULL, "backendData" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "noteId" integer, "userId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "media_upload"("uuid", "fileName", "backendType", "backendData", "createdAt", "noteId", "userId") SELECT "uuid", "fileName", "backendType", "backendData", "createdAt", "noteId", "userId" FROM "temporary_media_upload"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_media_upload"`);
    await queryRunner.query(`DROP INDEX "IDX_928dd947355b0837366470a916"`);
    await queryRunner.query(
      `ALTER TABLE "history_entry" RENAME TO "temporary_history_entry"`,
    );
    await queryRunner.query(
      `CREATE TABLE "history_entry" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "pinStatus" boolean NOT NULL, "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "userId" integer, "noteId" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "history_entry"("id", "pinStatus", "updatedAt", "userId", "noteId") SELECT "id", "pinStatus", "updatedAt", "userId", "noteId" FROM "temporary_history_entry"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_history_entry"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_928dd947355b0837366470a916" ON "history_entry" ("noteId", "userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "api_token" RENAME TO "temporary_api_token"`,
    );
    await queryRunner.query(
      `CREATE TABLE "api_token" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "keyId" varchar NOT NULL, "label" varchar NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "hash" varchar NOT NULL, "validUntil" datetime NOT NULL, "lastUsedAt" date, "userId" integer, CONSTRAINT "UQ_3e254e2eb542a65da7c405d0683" UNIQUE ("keyId"), CONSTRAINT "UQ_60221392192b32c7560c128a6fa" UNIQUE ("hash"))`,
    );
    await queryRunner.query(
      `INSERT INTO "api_token"("id", "keyId", "label", "createdAt", "hash", "validUntil", "lastUsedAt", "userId") SELECT "id", "keyId", "label", "createdAt", "hash", "validUntil", "lastUsedAt", "userId" FROM "temporary_api_token"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_api_token"`);
    await queryRunner.query(`DROP INDEX "IDX_470886feb50e30114e39c42698"`);
    await queryRunner.query(`DROP INDEX "IDX_52c6a61e1a646768391c7854fe"`);
    await queryRunner.query(`DROP TABLE "revision_edits_edit"`);
    await queryRunner.query(`DROP INDEX "IDX_19dbafe2a8b456c0ef40858d49"`);
    await queryRunner.query(`DROP INDEX "IDX_3382f45eefeb40f91e45cfd418"`);
    await queryRunner.query(`DROP TABLE "revision_tags_tag"`);
    await queryRunner.query(`DROP INDEX "IDX_427107c650638bcb2f1e167d2e"`);
    await queryRunner.query(`DROP INDEX "IDX_bfa303089d367a2e3c02b002b8"`);
    await queryRunner.query(`DROP TABLE "group_members_user"`);
    await queryRunner.query(`DROP TABLE "identity"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "author"`);
    await queryRunner.query(`DROP INDEX "IDX_28c5d1d16da7908c97c9bc2f74"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "edit"`);
    await queryRunner.query(`DROP TABLE "revision"`);
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TABLE "note"`);
    await queryRunner.query(`DROP TABLE "alias"`);
    await queryRunner.query(`DROP INDEX "IDX_5a3e91233d8878f98f5ad86b71"`);
    await queryRunner.query(`DROP TABLE "note_user_permission"`);
    await queryRunner.query(`DROP INDEX "IDX_ee1744842a9ef3ffbc05a7016a"`);
    await queryRunner.query(`DROP TABLE "note_group_permission"`);
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`DROP TABLE "media_upload"`);
    await queryRunner.query(`DROP INDEX "IDX_928dd947355b0837366470a916"`);
    await queryRunner.query(`DROP TABLE "history_entry"`);
    await queryRunner.query(`DROP TABLE "api_token"`);
  }
}
