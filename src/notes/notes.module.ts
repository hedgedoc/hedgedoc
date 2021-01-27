/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { RevisionsModule } from '../revisions/revisions.module';
import { UsersModule } from '../users/users.module';
import { AuthorColor } from './author-color.entity';
import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { Tag } from './tag.entity';
import { NoteGroupPermission } from '../permissions/note-group-permission.entity';
import { NoteUserPermission } from '../permissions/note-user-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Note,
      AuthorColor,
      Tag,
      NoteGroupPermission,
      NoteUserPermission,
    ]),
    forwardRef(() => RevisionsModule),
    UsersModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
