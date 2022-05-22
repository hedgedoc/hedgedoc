/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupsModule } from '../groups/groups.module';
import { LoggerModule } from '../logger/logger.module';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';
import { RevisionsModule } from '../revisions/revisions.module';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { Alias } from './alias.entity';
import { AliasService } from './alias.service';
import { ForbiddenNoteIdOrAliasService } from './forbidden-note-id-or-alias.service';
import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { Tag } from './tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Note,
      Tag,
      NoteGroupPermission,
      NoteUserPermission,
      User,
      Alias,
    ]),
    forwardRef(() => RevisionsModule),
    UsersModule,
    GroupsModule,
    LoggerModule,
    ConfigModule,
  ],
  controllers: [],
  providers: [NotesService, AliasService, ForbiddenNoteIdOrAliasService],
  exports: [NotesService, AliasService, ForbiddenNoteIdOrAliasService],
})
export class NotesModule {}
