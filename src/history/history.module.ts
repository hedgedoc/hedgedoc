/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { HistoryService } from './history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryEntry } from './history-entry.entity';
import { UsersModule } from '../users/users.module';
import { NotesModule } from '../notes/notes.module';

@Module({
  providers: [HistoryService],
  exports: [HistoryService],
  imports: [
    LoggerModule,
    TypeOrmModule.forFeature([HistoryEntry]),
    UsersModule,
    NotesModule,
  ],
})
export class HistoryModule {}
