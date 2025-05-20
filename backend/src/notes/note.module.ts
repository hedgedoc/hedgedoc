/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';

import { AliasModule } from '../alias/alias.module';
import { GroupsModule } from '../groups/groups.module';
import { LoggerModule } from '../logger/logger.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RealtimeNoteModule } from '../realtime/realtime-note/realtime-note.module';
import { RevisionsModule } from '../revisions/revisions.module';
import { UsersModule } from '../users/users.module';
import { NoteService } from './note.service';

@Module({
  imports: [
    AliasModule,
    RevisionsModule,
    UsersModule,
    GroupsModule,
    LoggerModule,
    forwardRef(() => PermissionsModule),
    ConfigModule,
    KnexModule,
  ],
  controllers: [],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
