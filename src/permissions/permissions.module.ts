/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupsModule } from '../groups/groups.module';
import { LoggerModule } from '../logger/logger.module';
import { Note } from '../notes/note.entity';
import { NotesModule } from '../notes/notes.module';
import { UsersModule } from '../users/users.module';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note]),
    NotesModule,
    UsersModule,
    GroupsModule,
    LoggerModule,
  ],
  exports: [PermissionsService],
  providers: [PermissionsService],
})
export class PermissionsModule {}
