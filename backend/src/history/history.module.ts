/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/logger.module';
import { NotesModule } from '../notes/notes.module';
import { RevisionsModule } from '../revisions/revisions.module';
import { UsersModule } from '../users/users.module';
import { HistoryEntry } from './history-entry.entity';
import { HistoryService } from './history.service';

@Module({
  providers: [HistoryService],
  exports: [HistoryService],
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([HistoryEntry]),
    UsersModule,
    NotesModule,
    ConfigModule,
    RevisionsModule,
  ],
})
export class HistoryModule {}
