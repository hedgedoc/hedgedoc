/*
 * SPDX-FileCopyrightText: 2022 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Module } from '@nestjs/common';

import { LoggerModule } from '../../logger/logger.module';
import { PermissionsModule } from '../../permissions/permissions.module';
import { RevisionsModule } from '../../revisions/revisions.module';
import { SessionModule } from '../../session/session.module';
import { UsersModule } from '../../users/users.module';
import { RealtimeNoteService } from './realtime-note.service';

@Module({
  imports: [
    LoggerModule,
    UsersModule,
    PermissionsModule,
    SessionModule,
    RevisionsModule,
  ],
  exports: [RealtimeNoteService],
  providers: [RealtimeNoteService],
})
export class RealtimeNoteModule {}
