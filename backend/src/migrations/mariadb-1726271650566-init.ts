/*
 * SPDX-FileCopyrightText: 2024 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1726271650566 implements MigrationInterface {
  name = 'Init1726271650566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`api_token\` (\`id\` int NOT NULL AUTO_INCREMENT, \`keyId\` varchar(255) NOT NULL, \`label\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`hash\` varchar(255) NOT NULL, \`validUntil\` datetime NOT NULL, \`lastUsedAt\` date NULL, \`userId\` int NULL, UNIQUE INDEX \`IDX_3e254e2eb542a65da7c405d068\` (\`keyId\`), UNIQUE INDEX \`IDX_60221392192b32c7560c128a6f\` (\`hash\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`history_entry\` (\`id\` int NOT NULL AUTO_INCREMENT, \`pinStatus\` tinyint NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`noteId\` int NULL, UNIQUE INDEX \`IDX_928dd947355b0837366470a916\` (\`noteId\`, \`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`media_upload\` (\`uuid\` varchar(255) NOT NULL, \`fileName\` varchar(255) NOT NULL, \`backendType\` varchar(255) NOT NULL, \`backendData\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`noteId\` int NULL, \`userId\` int NULL, PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`group\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`displayName\` varchar(255) NOT NULL, \`special\` tinyint NOT NULL, UNIQUE INDEX \`IDX_8a45300fd825918f3b40195fbd\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`note_group_permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`canEdit\` tinyint NOT NULL, \`groupId\` int NULL, \`noteId\` int NULL, UNIQUE INDEX \`IDX_ee1744842a9ef3ffbc05a7016a\` (\`groupId\`, \`noteId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`note_user_permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`canEdit\` tinyint NOT NULL, \`userId\` int NULL, \`noteId\` int NULL, UNIQUE INDEX \`IDX_5a3e91233d8878f98f5ad86b71\` (\`userId\`, \`noteId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`alias\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`primary\` tinyint NULL COMMENT 'This field tells you if this is the primary alias of the note. If this field is null, that means this alias is not primary.', \`noteId\` int NULL, UNIQUE INDEX \`IDX_89f27e45cc5c1e43abd9132c9b\` (\`name\`), UNIQUE INDEX \`Only one primary alias per note\` (\`noteId\`, \`primary\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`note\` (\`id\` int NOT NULL AUTO_INCREMENT, \`publicId\` text NOT NULL, \`viewCount\` int NOT NULL DEFAULT '0', \`version\` int NOT NULL DEFAULT '2', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`ownerId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`tag\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`revision\` (\`id\` int NOT NULL AUTO_INCREMENT, \`patch\` text NOT NULL, \`title\` text NOT NULL, \`description\` text NOT NULL, \`content\` text NOT NULL, \`length\` int NOT NULL, \`yjsStateVector\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`noteId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`edit\` (\`id\` int NOT NULL AUTO_INCREMENT, \`startPos\` int NOT NULL, \`endPos\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`authorId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`session\` (\`id\` varchar(255) NOT NULL, \`expiredAt\` bigint NOT NULL, \`json\` text NOT NULL, \`destroyedAt\` datetime(6) NULL, \`authorId\` int NULL, INDEX \`IDX_28c5d1d16da7908c97c9bc2f74\` (\`expiredAt\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`author\` (\`id\` int NOT NULL AUTO_INCREMENT, \`color\` int NOT NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`displayName\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`photo\` text NULL, \`email\` text NULL, UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`identity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`providerType\` varchar(255) NOT NULL, \`providerIdentifier\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`providerUserId\` text NULL, \`passwordHash\` text NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`group_members_user\` (\`groupId\` int NOT NULL, \`userId\` int NOT NULL, INDEX \`IDX_bfa303089d367a2e3c02b002b8\` (\`groupId\`), INDEX \`IDX_427107c650638bcb2f1e167d2e\` (\`userId\`), PRIMARY KEY (\`groupId\`, \`userId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`revision_tags_tag\` (\`revisionId\` int NOT NULL, \`tagId\` int NOT NULL, INDEX \`IDX_3382f45eefeb40f91e45cfd418\` (\`revisionId\`), INDEX \`IDX_19dbafe2a8b456c0ef40858d49\` (\`tagId\`), PRIMARY KEY (\`revisionId\`, \`tagId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`revision_edits_edit\` (\`revisionId\` int NOT NULL, \`editId\` int NOT NULL, INDEX \`IDX_52c6a61e1a646768391c7854fe\` (\`revisionId\`), INDEX \`IDX_470886feb50e30114e39c42698\` (\`editId\`), PRIMARY KEY (\`revisionId\`, \`editId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`api_token\` ADD CONSTRAINT \`FK_cbfc4e2b85b78207afb0b2d7fbc\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_entry\` ADD CONSTRAINT \`FK_42b8ae461cb58747a24340e6c64\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_entry\` ADD CONSTRAINT \`FK_8f3595373fc9f6a32f126270422\` FOREIGN KEY (\`noteId\`) REFERENCES \`note\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`media_upload\` ADD CONSTRAINT \`FK_edba6d4e0f3bcf6605772f0af6b\` FOREIGN KEY (\`noteId\`) REFERENCES \`note\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`media_upload\` ADD CONSTRAINT \`FK_73ce66b082df1df2003e305e9ac\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`note_group_permission\` ADD CONSTRAINT \`FK_743ea3d9e0e26d7cbb9c174e56b\` FOREIGN KEY (\`groupId\`) REFERENCES \`group\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`note_group_permission\` ADD CONSTRAINT \`FK_fd5c9329d8b45cb160676f8d8c1\` FOREIGN KEY (\`noteId\`) REFERENCES \`note\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`note_user_permission\` ADD CONSTRAINT \`FK_03cea81e07bab8864de026d517d\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`note_user_permission\` ADD CONSTRAINT \`FK_bc1ca3a87a9d662350d281a7f16\` FOREIGN KEY (\`noteId\`) REFERENCES \`note\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`alias\` ADD CONSTRAINT \`FK_63012a303e6ca53144a8b7b64b0\` FOREIGN KEY (\`noteId\`) REFERENCES \`note\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`note\` ADD CONSTRAINT \`FK_b09836eba01a8653c0628a78af8\` FOREIGN KEY (\`ownerId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`revision\` ADD CONSTRAINT \`FK_8ac498c7c70de43d01b94fe7905\` FOREIGN KEY (\`noteId\`) REFERENCES \`note\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`edit\` ADD CONSTRAINT \`FK_bbab22ed1a0e243b28623f4f48a\` FOREIGN KEY (\`authorId\`) REFERENCES \`author\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`session\` ADD CONSTRAINT \`FK_e5da4837ed9d236532b3215a84e\` FOREIGN KEY (\`authorId\`) REFERENCES \`author\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`author\` ADD CONSTRAINT \`FK_645811deaaaa772f9e6c2a4b927\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`identity\` ADD CONSTRAINT \`FK_12915039d2868ab654567bf5181\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_members_user\` ADD CONSTRAINT \`FK_bfa303089d367a2e3c02b002b8f\` FOREIGN KEY (\`groupId\`) REFERENCES \`group\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_members_user\` ADD CONSTRAINT \`FK_427107c650638bcb2f1e167d2e5\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`revision_tags_tag\` ADD CONSTRAINT \`FK_3382f45eefeb40f91e45cfd4180\` FOREIGN KEY (\`revisionId\`) REFERENCES \`revision\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`revision_tags_tag\` ADD CONSTRAINT \`FK_19dbafe2a8b456c0ef40858d49f\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`revision_edits_edit\` ADD CONSTRAINT \`FK_52c6a61e1a646768391c7854feb\` FOREIGN KEY (\`revisionId\`) REFERENCES \`revision\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`revision_edits_edit\` ADD CONSTRAINT \`FK_470886feb50e30114e39c426987\` FOREIGN KEY (\`editId\`) REFERENCES \`edit\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`revision_edits_edit\` DROP FOREIGN KEY \`FK_470886feb50e30114e39c426987\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`revision_edits_edit\` DROP FOREIGN KEY \`FK_52c6a61e1a646768391c7854feb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`revision_tags_tag\` DROP FOREIGN KEY \`FK_19dbafe2a8b456c0ef40858d49f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`revision_tags_tag\` DROP FOREIGN KEY \`FK_3382f45eefeb40f91e45cfd4180\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_members_user\` DROP FOREIGN KEY \`FK_427107c650638bcb2f1e167d2e5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`group_members_user\` DROP FOREIGN KEY \`FK_bfa303089d367a2e3c02b002b8f\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`identity\` DROP FOREIGN KEY \`FK_12915039d2868ab654567bf5181\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`author\` DROP FOREIGN KEY \`FK_645811deaaaa772f9e6c2a4b927\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`session\` DROP FOREIGN KEY \`FK_e5da4837ed9d236532b3215a84e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`edit\` DROP FOREIGN KEY \`FK_bbab22ed1a0e243b28623f4f48a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`revision\` DROP FOREIGN KEY \`FK_8ac498c7c70de43d01b94fe7905\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`note\` DROP FOREIGN KEY \`FK_b09836eba01a8653c0628a78af8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`alias\` DROP FOREIGN KEY \`FK_63012a303e6ca53144a8b7b64b0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`note_user_permission\` DROP FOREIGN KEY \`FK_bc1ca3a87a9d662350d281a7f16\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`note_user_permission\` DROP FOREIGN KEY \`FK_03cea81e07bab8864de026d517d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`note_group_permission\` DROP FOREIGN KEY \`FK_fd5c9329d8b45cb160676f8d8c1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`note_group_permission\` DROP FOREIGN KEY \`FK_743ea3d9e0e26d7cbb9c174e56b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`media_upload\` DROP FOREIGN KEY \`FK_73ce66b082df1df2003e305e9ac\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`media_upload\` DROP FOREIGN KEY \`FK_edba6d4e0f3bcf6605772f0af6b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_entry\` DROP FOREIGN KEY \`FK_8f3595373fc9f6a32f126270422\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_entry\` DROP FOREIGN KEY \`FK_42b8ae461cb58747a24340e6c64\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`api_token\` DROP FOREIGN KEY \`FK_cbfc4e2b85b78207afb0b2d7fbc\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_470886feb50e30114e39c42698\` ON \`revision_edits_edit\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_52c6a61e1a646768391c7854fe\` ON \`revision_edits_edit\``,
    );
    await queryRunner.query(`DROP TABLE \`revision_edits_edit\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_19dbafe2a8b456c0ef40858d49\` ON \`revision_tags_tag\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_3382f45eefeb40f91e45cfd418\` ON \`revision_tags_tag\``,
    );
    await queryRunner.query(`DROP TABLE \`revision_tags_tag\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_427107c650638bcb2f1e167d2e\` ON \`group_members_user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_bfa303089d367a2e3c02b002b8\` ON \`group_members_user\``,
    );
    await queryRunner.query(`DROP TABLE \`group_members_user\``);
    await queryRunner.query(`DROP TABLE \`identity\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`author\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_28c5d1d16da7908c97c9bc2f74\` ON \`session\``,
    );
    await queryRunner.query(`DROP TABLE \`session\``);
    await queryRunner.query(`DROP TABLE \`edit\``);
    await queryRunner.query(`DROP TABLE \`revision\``);
    await queryRunner.query(`DROP TABLE \`tag\``);
    await queryRunner.query(`DROP TABLE \`note\``);
    await queryRunner.query(
      `DROP INDEX \`Only one primary alias per note\` ON \`alias\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_89f27e45cc5c1e43abd9132c9b\` ON \`alias\``,
    );
    await queryRunner.query(`DROP TABLE \`alias\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_5a3e91233d8878f98f5ad86b71\` ON \`note_user_permission\``,
    );
    await queryRunner.query(`DROP TABLE \`note_user_permission\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_ee1744842a9ef3ffbc05a7016a\` ON \`note_group_permission\``,
    );
    await queryRunner.query(`DROP TABLE \`note_group_permission\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_8a45300fd825918f3b40195fbd\` ON \`group\``,
    );
    await queryRunner.query(`DROP TABLE \`group\``);
    await queryRunner.query(`DROP TABLE \`media_upload\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_928dd947355b0837366470a916\` ON \`history_entry\``,
    );
    await queryRunner.query(`DROP TABLE \`history_entry\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_60221392192b32c7560c128a6f\` ON \`api_token\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_3e254e2eb542a65da7c405d068\` ON \`api_token\``,
    );
    await queryRunner.query(`DROP TABLE \`api_token\``);
  }
}
