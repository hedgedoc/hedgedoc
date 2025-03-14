/*
 * SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';

import { GroupsModule } from '../groups/groups.module';
import { LoggerModule } from '../logger/logger.module';
import { RealtimeNoteModule } from '../realtime/realtime-note/realtime-note.module';
import { RevisionsModule } from '../revisions/revisions.module';
import { UsersModule } from '../users/users.module';
import { NoteService } from './note.service';

@Module({
  imports: [
    RevisionsModule,
    UsersModule,
    GroupsModule,
    LoggerModule,
    ConfigModule,
    RealtimeNoteModule,
    KnexModule,
  ],
  controllers: [],
  providers: [NoteService],
  exports: [NoteService],
})
export class NoteModule {}
