/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1726271794336 implements MigrationInterface {
  name = 'Init1726271794336';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "api_token" ("id" SERIAL NOT NULL, "keyId" character varying NOT NULL, "label" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "hash" character varying NOT NULL, "validUntil" TIMESTAMP NOT NULL, "lastUsedAt" date, "userId" integer, CONSTRAINT "UQ_3e254e2eb542a65da7c405d0683" UNIQUE ("keyId"), CONSTRAINT "UQ_60221392192b32c7560c128a6fa" UNIQUE ("hash"), CONSTRAINT "PK_d862311c568d175c26f41bc6f98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "history_entry" ("id" SERIAL NOT NULL, "pinStatus" boolean NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "noteId" integer, CONSTRAINT "PK_b65bd95b0d2929668589d57b97a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_928dd947355b0837366470a916" ON "history_entry" ("noteId", "userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "media_upload" ("uuid" character varying NOT NULL, "fileName" character varying NOT NULL, "backendType" character varying NOT NULL, "backendData" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "noteId" integer, "userId" integer, CONSTRAINT "PK_573c2a4f2a8f8382f2a8758444e" PRIMARY KEY ("uuid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "displayName" character varying NOT NULL, "special" boolean NOT NULL, CONSTRAINT "UQ_8a45300fd825918f3b40195fbdc" UNIQUE ("name"), CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "note_group_permission" ("id" SERIAL NOT NULL, "canEdit" boolean NOT NULL, "groupId" integer, "noteId" integer, CONSTRAINT "PK_6327989190949e6a55d02a080c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ee1744842a9ef3ffbc05a7016a" ON "note_group_permission" ("groupId", "noteId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "note_user_permission" ("id" SERIAL NOT NULL, "canEdit" boolean NOT NULL, "userId" integer, "noteId" integer, CONSTRAINT "PK_672af1e0c89837f0aa390d34b8d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_5a3e91233d8878f98f5ad86b71" ON "note_user_permission" ("userId", "noteId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "alias" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "primary" boolean, "noteId" integer, CONSTRAINT "UQ_89f27e45cc5c1e43abd9132c9b9" UNIQUE ("name"), CONSTRAINT "Only one primary alias per note" UNIQUE ("noteId", "primary"), CONSTRAINT "PK_b1848d04b41d10a5712fc2e673c" PRIMARY KEY ("id")); COMMENT ON COLUMN "alias"."primary" IS 'This field tells you if this is the primary alias of the note. If this field is null, that means this alias is not primary.'`,
    );
    await queryRunner.query(
      `CREATE TABLE "note" ("id" SERIAL NOT NULL, "publicId" text NOT NULL, "viewCount" integer NOT NULL DEFAULT '0', "version" integer NOT NULL DEFAULT '2', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ownerId" integer, CONSTRAINT "PK_96d0c172a4fba276b1bbed43058" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "revision" ("id" SERIAL NOT NULL, "patch" text NOT NULL, "title" text NOT NULL, "description" text NOT NULL, "content" text NOT NULL, "length" integer NOT NULL, "yjsStateVector" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "noteId" integer, CONSTRAINT "PK_f4767cdf0c0e78041514e5a94be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "edit" ("id" SERIAL NOT NULL, "startPos" integer NOT NULL, "endPos" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "authorId" integer, CONSTRAINT "PK_062a4b68154c101205e4595810d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" character varying(255) NOT NULL, "expiredAt" bigint NOT NULL, "json" text NOT NULL, "destroyedAt" TIMESTAMP, "authorId" integer, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28c5d1d16da7908c97c9bc2f74" ON "session" ("expiredAt") `,
    );
    await queryRunner.query(
      `CREATE TABLE "author" ("id" SERIAL NOT NULL, "color" integer NOT NULL, "userId" integer, CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "displayName" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "photo" text, "email" text, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "identity" ("id" SERIAL NOT NULL, "providerType" character varying NOT NULL, "providerIdentifier" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "providerUserId" text, "passwordHash" text, "userId" integer, CONSTRAINT "PK_ff16a44186b286d5e626178f726" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "group_members_user" ("groupId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_7170c9a27e7b823d391d9e11f2e" PRIMARY KEY ("groupId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bfa303089d367a2e3c02b002b8" ON "group_members_user" ("groupId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_427107c650638bcb2f1e167d2e" ON "group_members_user" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "revision_tags_tag" ("revisionId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_006354d3ecad6cb1e606320647b" PRIMARY KEY ("revisionId", "tagId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3382f45eefeb40f91e45cfd418" ON "revision_tags_tag" ("revisionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_19dbafe2a8b456c0ef40858d49" ON "revision_tags_tag" ("tagId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "revision_edits_edit" ("revisionId" integer NOT NULL, "editId" integer NOT NULL, CONSTRAINT "PK_2651ab66ea1c428e844a80d81ed" PRIMARY KEY ("revisionId", "editId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52c6a61e1a646768391c7854fe" ON "revision_edits_edit" ("revisionId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_470886feb50e30114e39c42698" ON "revision_edits_edit" ("editId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "api_token" ADD CONSTRAINT "FK_cbfc4e2b85b78207afb0b2d7fbc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "history_entry" ADD CONSTRAINT "FK_42b8ae461cb58747a24340e6c64" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "history_entry" ADD CONSTRAINT "FK_8f3595373fc9f6a32f126270422" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_upload" ADD CONSTRAINT "FK_edba6d4e0f3bcf6605772f0af6b" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_upload" ADD CONSTRAINT "FK_73ce66b082df1df2003e305e9ac" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_group_permission" ADD CONSTRAINT "FK_743ea3d9e0e26d7cbb9c174e56b" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_group_permission" ADD CONSTRAINT "FK_fd5c9329d8b45cb160676f8d8c1" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_user_permission" ADD CONSTRAINT "FK_03cea81e07bab8864de026d517d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_user_permission" ADD CONSTRAINT "FK_bc1ca3a87a9d662350d281a7f16" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alias" ADD CONSTRAINT "FK_63012a303e6ca53144a8b7b64b0" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "note" ADD CONSTRAINT "FK_b09836eba01a8653c0628a78af8" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "revision" ADD CONSTRAINT "FK_8ac498c7c70de43d01b94fe7905" FOREIGN KEY ("noteId") REFERENCES "note"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "edit" ADD CONSTRAINT "FK_bbab22ed1a0e243b28623f4f48a" FOREIGN KEY ("authorId") REFERENCES "author"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_e5da4837ed9d236532b3215a84e" FOREIGN KEY ("authorId") REFERENCES "author"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "author" ADD CONSTRAINT "FK_645811deaaaa772f9e6c2a4b927" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "identity" ADD CONSTRAINT "FK_12915039d2868ab654567bf5181" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" ADD CONSTRAINT "FK_bfa303089d367a2e3c02b002b8f" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" ADD CONSTRAINT "FK_427107c650638bcb2f1e167d2e5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "revision_tags_tag" ADD CONSTRAINT "FK_3382f45eefeb40f91e45cfd4180" FOREIGN KEY ("revisionId") REFERENCES "revision"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "revision_tags_tag" ADD CONSTRAINT "FK_19dbafe2a8b456c0ef40858d49f" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "revision_edits_edit" ADD CONSTRAINT "FK_52c6a61e1a646768391c7854feb" FOREIGN KEY ("revisionId") REFERENCES "revision"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "revision_edits_edit" ADD CONSTRAINT "FK_470886feb50e30114e39c426987" FOREIGN KEY ("editId") REFERENCES "edit"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "revision_edits_edit" DROP CONSTRAINT "FK_470886feb50e30114e39c426987"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revision_edits_edit" DROP CONSTRAINT "FK_52c6a61e1a646768391c7854feb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revision_tags_tag" DROP CONSTRAINT "FK_19dbafe2a8b456c0ef40858d49f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revision_tags_tag" DROP CONSTRAINT "FK_3382f45eefeb40f91e45cfd4180"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" DROP CONSTRAINT "FK_427107c650638bcb2f1e167d2e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "group_members_user" DROP CONSTRAINT "FK_bfa303089d367a2e3c02b002b8f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "identity" DROP CONSTRAINT "FK_12915039d2868ab654567bf5181"`,
    );
    await queryRunner.query(
      `ALTER TABLE "author" DROP CONSTRAINT "FK_645811deaaaa772f9e6c2a4b927"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_e5da4837ed9d236532b3215a84e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "edit" DROP CONSTRAINT "FK_bbab22ed1a0e243b28623f4f48a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "revision" DROP CONSTRAINT "FK_8ac498c7c70de43d01b94fe7905"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note" DROP CONSTRAINT "FK_b09836eba01a8653c0628a78af8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alias" DROP CONSTRAINT "FK_63012a303e6ca53144a8b7b64b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_user_permission" DROP CONSTRAINT "FK_bc1ca3a87a9d662350d281a7f16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_user_permission" DROP CONSTRAINT "FK_03cea81e07bab8864de026d517d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_group_permission" DROP CONSTRAINT "FK_fd5c9329d8b45cb160676f8d8c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "note_group_permission" DROP CONSTRAINT "FK_743ea3d9e0e26d7cbb9c174e56b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_upload" DROP CONSTRAINT "FK_73ce66b082df1df2003e305e9ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "media_upload" DROP CONSTRAINT "FK_edba6d4e0f3bcf6605772f0af6b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "history_entry" DROP CONSTRAINT "FK_8f3595373fc9f6a32f126270422"`,
    );
    await queryRunner.query(
      `ALTER TABLE "history_entry" DROP CONSTRAINT "FK_42b8ae461cb58747a24340e6c64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "api_token" DROP CONSTRAINT "FK_cbfc4e2b85b78207afb0b2d7fbc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_470886feb50e30114e39c42698"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_52c6a61e1a646768391c7854fe"`,
    );
    await queryRunner.query(`DROP TABLE "revision_edits_edit"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_19dbafe2a8b456c0ef40858d49"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3382f45eefeb40f91e45cfd418"`,
    );
    await queryRunner.query(`DROP TABLE "revision_tags_tag"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_427107c650638bcb2f1e167d2e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bfa303089d367a2e3c02b002b8"`,
    );
    await queryRunner.query(`DROP TABLE "group_members_user"`);
    await queryRunner.query(`DROP TABLE "identity"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "author"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_28c5d1d16da7908c97c9bc2f74"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "edit"`);
    await queryRunner.query(`DROP TABLE "revision"`);
    await queryRunner.query(`DROP TABLE "tag"`);
    await queryRunner.query(`DROP TABLE "note"`);
    await queryRunner.query(`DROP TABLE "alias"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5a3e91233d8878f98f5ad86b71"`,
    );
    await queryRunner.query(`DROP TABLE "note_user_permission"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee1744842a9ef3ffbc05a7016a"`,
    );
    await queryRunner.query(`DROP TABLE "note_group_permission"`);
    await queryRunner.query(`DROP TABLE "group"`);
    await queryRunner.query(`DROP TABLE "media_upload"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_928dd947355b0837366470a916"`,
    );
    await queryRunner.query(`DROP TABLE "history_entry"`);
    await queryRunner.query(`DROP TABLE "api_token"`);
  }
}
